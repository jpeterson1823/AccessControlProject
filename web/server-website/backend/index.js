const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const unirest = require("unirest");



const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
//const HASHPEPPER = String(process.env.HASHPEPPER);
//const TOTP_SECRET = String(process.env.TOTP_SECRET);

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: MYSQLDB
});



app.get("/query", function (request, response) {
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})



app.use("/", express.static("frontend", { index : "login.html" }));
//app.set('view engine', 'ejs')


app.listen(PORT, HOST);
console.log(`[server-data] Running on http://${HOST}:${PORT}`);
