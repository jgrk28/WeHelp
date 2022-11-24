const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
require("dotenv").config();

const app = express();
const port = 3000;

const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.use(express.static("public"));

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/member", (req, res) => {
  if (req.session.username) {
    res.sendFile(path.join(__dirname, "public/member.html"));
  } else {
    res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  const sqlQuery = `SELECT password FROM users WHERE username = '${username}'`;
  conn.query(sqlQuery, (err, result) => {
    if (err) throw err;
    let inputPassword = req.body.password;
    if (result[0] && inputPassword == result[0].password) {
      req.session.username = username;
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

app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});

// conn.end((err) => {
//   if (err) throw err;
//   console.log("Disconnected!");
// })
