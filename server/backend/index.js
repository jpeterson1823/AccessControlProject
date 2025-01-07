const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qr_code = require("qrcode");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const HASHPEPPER = String(process.env.HASHPEPPER);
const SQL = "SELECT * from users;"

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static("frontend", { index : "login.html" }));
//app.set('view engine', 'ejs')


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

app.get("/totp_qr", function (requests, response) {

})

app.post("/login", function (request, response) {
    // first, use username-password authentication
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
                    //response.status(200).send("Success");
                    qr_code.toDataURL(speakeasy.generateSecret().otpauth_url, (err, data_url) => {
                        console.log(data_url);
                        response.status(200).send({
                            "qrurl" : data_url
                        });
                    });
                }
            });
        }

        //// totp
        //// generate secret to use after first login
        //var secret = speakeasy.generateSecret();

        //// generate and display TOTP QR code
        //qr_code.toDataURL(secret.otpauth_url, (err, data_url) => {
        //    console.log("data_url : " + data_url);
        //    response.write('<img src="' + data_url + "'>");
        //});

        // get user token
        //var userToken = window.prompt("Please enter your TOTP token.");

        //// verify token
        //var verified = speakeasy.totp.verify({
        //    secret: secret.base32secret,
        //    encoding: 'base32',
        //    token: userToken
        //});

        //if (verified) {
        //    response.status(200).send("Success");
        //}
        //else {
        //    console.log("TOTP 2FA failed.");
        //    response.status(401).send("unauthorized");
        //}
    });
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
