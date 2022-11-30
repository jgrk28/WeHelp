import express from "express";
import { createConnection } from "mysql";
import parser from "body-parser";
import session from "express-session";
import { promisify } from "util";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
dotenv.config();

const app = express();
const port = 3000;

const conn = createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
const promiseQuery = promisify(conn.query).bind(conn);

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

app.post("/login", (req, res) => {
  let username = req.body.username;
  const sqlQuery = `SELECT password, id FROM users WHERE username = '${username}'`;
  conn.query(sqlQuery, (err, result) => {
    if (err) throw err;
    let inputPassword = req.body.password;
    if (result[0] && inputPassword == result[0].password) {
      req.session.username = username;
      req.session.userid = result[0].id;
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });
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
  const countQuery = `SELECT COUNT(*) FROM users WHERE username = '${username}'`;
  const insertQuery = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
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
  // to add pagination
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let offset = (page - 1) * pageSize;

  try {
    const getQuery = `SELECT username, s3_image_key FROM images 
      INNER JOIN users ON images.user_id=users.id 
      ORDER BY time DESC 
      LIMIT ${pageSize} OFFSET ${offset}`;
    let result = await promiseQuery(getQuery);
    let responseData = [];

    // to add like status in responseData
    // let userId = req.session.userid;

    result.forEach((image) => {
      let s3Key = image["s3_image_key"];
      let username = image["username"];
      let signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3Key,
        Expires: 3600,
      });
      responseData.push({
        image: signedUrl,
        username: username,
      });
    });

    res.status(200).send(responseData);
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
