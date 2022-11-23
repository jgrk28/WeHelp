const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
require("dotenv").config()

const app = express();
const port = 3000;
console.log(process.env)
console.log(process.env.MYSQL_HOST)

const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
})

app.use(express.static("public"));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/member", (req, res) => {
  res.sendFile(path.join(__dirname, "public/member.html"));
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  const sqlQuery = `SELECT password FROM users WHERE username = '${email}'`;
  conn.query(sqlQuery, (err, result) => {
    if (err) throw err;
    let inputPassword = req.body.password;
    if (result[0] && inputPassword == result[0].password) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  })

});

app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});

  // conn.end((err) => {
  //   if (err) throw err;
  //   console.log("Disconnected!");
  // })
