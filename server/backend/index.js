const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const SQL = "SELECT * FROM users;"

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static("frontend"));


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

app.post("/login", function (request, response) {
    let body = JSON.parse(request["body"]);
    let SQL = "SELECT * FROM users WHERE username=" + body["username"] + ";"
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            let combinedPass = results[0]["salt"] + body["password"] + PEPPER;
            bcrypt.compare(combinedPass, results[0]["password"], function(err, result) {
                if (results.length = 0) {
                    console.log("Username not found");
                    response.status(401).send("unauthorized");
                } else {
                    console.log(result);
                    response.status(200).send("Success");
                }
            });
        }
    });
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
