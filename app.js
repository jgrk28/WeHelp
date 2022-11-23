const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "winstagram"
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
