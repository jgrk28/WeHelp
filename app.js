import AWS from "aws-sdk";
import bcrypt from "bcrypt"
import parser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import multer from "multer";
import multerS3 from "multer-s3";
import { createConnection } from "mysql";
import { promisify } from "util";

dotenv.config();

const app = express();
const port = process.env.NODE_DOCKER_PORT || 3000;

const conn = createConnection({
  host: process.env.DB_HOST,
  user: "root",
  password: process.env.DB_ROOT_PASSWORD,
  database: process.env.DB_NAME,
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
const promiseQuery = promisify(conn.query).bind(conn);
const promiseHash = promisify(bcrypt.hash);
const promiseCompare = promisify(bcrypt.compare);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
  signatureVersion: "v4",
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `${req.session.userid}_${Date.now().toString()}`);
    },
  }),
});

app.use(express.static("public"));

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "pug");
app.set("views", "./public");

const saltRounds = 10;

app.get("/", (req, res) => {
  res.render("index", { username: req.session.username });
});

app.get("/member", (req, res) => {
  if (req.session.username) {
    res.set("Cache-Control", "no-store");
    res.render("member", { username: req.session.username });
  } else {
    res.redirect("/");
  }
});

app.post("/login", async (req, res) => {
  let username = req.body.username;
  const sqlQuery = `SELECT password, id FROM users WHERE username = '${username}'`;
  let result = await promiseQuery(sqlQuery);

  let inputPassword = req.body.password;

  if (!result[0]) {
    res.sendStatus(401);
  } else {
    let hash = result[0].password
    let compareSuccess = await promiseCompare(inputPassword, hash)
    if (compareSuccess) {
      req.session.username = username;
      req.session.userid = result[0].id;
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  }
});

app.get("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post("/signup", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let hash = await promiseHash(password, saltRounds);
  const countQuery = `SELECT COUNT(*) FROM users WHERE username = '${username}'`;
  const insertQuery = `INSERT INTO users (username, password) VALUES ('${username}', '${hash}')`;
  try {
    let result = await promiseQuery(countQuery);
    if (result[0]["COUNT(*)"] > 0) {
      res.status(409).send("Username already exists.");
      return;
    }
    let insertResult = await promiseQuery(insertQuery);
    req.session.username = username;
    req.session.userid = insertResult.insertId;
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

app.post("/image", upload.single("image"), async (req, res) => {
  // confirm session exists?
  let userId = req.session.userid;
  let s3Key = req.file.key;
  try {
    const insertQuery = `INSERT INTO images (s3_image_key, user_id) VALUES ('${s3Key}', '${userId}')`;
    await promiseQuery(insertQuery);
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

app.get("/images", async (req, res) => {
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let offset = (page - 1) * pageSize;

  try {
    let userId = req.session.userid;
    if (!userId) {
      userId = -1;
    };
    const getQuery = `
      SELECT
        username,
        s3_image_key,
        count(likes.user_id) AS num_likes,
        IF(
          EXISTS(
            SELECT * 
            FROM likes 
            WHERE likes.user_id = ${userId} AND likes.image_id = images.id
            ),
          true,
          false) AS liked 
      FROM images 
      INNER JOIN users ON images.user_id=users.id 
      LEFT JOIN likes ON likes.image_id=images.id 
      GROUP BY images.id
      ORDER BY time DESC 
      LIMIT ${pageSize} OFFSET ${offset}`;
    let result = await promiseQuery(getQuery);
    let responseData = [];

    result.forEach((image) => {
      let s3Key = image["s3_image_key"];
      let username = image["username"];
      let numLikes = image["num_likes"];
      let isLiked = image["liked"];
      let signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3Key,
        Expires: 3600,
      });
      responseData.push({
        image: signedUrl,
        username: username,
        likes: numLikes,
        liked: isLiked
      });
    });

    res.status(200).send(responseData);
  } catch (error) {
    throw error;
  }
});

app.post("/images/:image_key/like", async (req, res) => {
  let s3Key = req.params.image_key;
  let userId = req.session.userid;
  if (!userId) {
    res.sendStatus(404);
    return;
  }
  try {
    const insertQuery = `
      INSERT INTO likes (user_id, image_id) 
      VALUES (
        ${userId}, 
        (SELECT id FROM images WHERE s3_image_key = '${s3Key}')
        )`;
    await promiseQuery(insertQuery);
    res.sendStatus(201);
  } catch (error) {
    throw error;
  }
});

app.delete("/images/:image_key/like", async (req, res) => {
  let s3Key = req.params.image_key;
  let userId = req.session.userid;
  if (!userId) {
    res.sendStatus(404);
    return;
  }
  try {
    const deleteQuery = `
    DELETE FROM likes 
    WHERE 
      user_id = ${userId} AND
      image_id = (SELECT id FROM images WHERE s3_image_key = '${s3Key}')`;
    await promiseQuery(deleteQuery);
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }

});

app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});

// conn.end((err) => {
//   if (err) throw err;
//   console.log("Disconnected!");
// })
