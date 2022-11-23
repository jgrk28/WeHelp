const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/member", (req, res) => {
  res.sendFile(path.join(__dirname, "public/member.html"));
});

app.post("/login", (req, res) => {
  if (req.body.email == "test" && req.body.password == "test") {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on ${port}`);
});
