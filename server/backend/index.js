const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const HASHPEPPER = String(process.env.HASHPEPPER);
const HASHSALT = String(process.env.HASHSALT);
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
    console.log(request["body"])
    let body = request["body"]
    let sqlQuery = "SELECT * FROM users WHERE username='" + body["username"] + "';"
    connection.query(sqlQuery, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            let combinedPass = results[0]["salt"] + body["password"] + HASHPEPPER;
            console.log("COMBINED: " + combinedPass)

            bcrypt.compare(combinedPass, results[0]["passhash"], (_, result) => {
                if (result == false) {
                    console.log("Username or password not found");
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
