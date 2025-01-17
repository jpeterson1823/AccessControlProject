const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const {createHmac} = require("crypto");
const jwt = require("jsonwebtoken");
const cors = require("cors")


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
const HASHPEPPER = String(process.env.HASHPEPPER);
const TOTP_SECRET = String(process.env.TOTP_SECRET);

const app = express();
app.use(express.json());
app.use(cors());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: MYSQLDB
});



app.post("/totp", function (request, response) {
    // first, use username-password authentication
    //console.log(request["body"])
    let body = request["body"]

    // set up hashing and get timestamp
    const hmac = createHmac("sha256", "a secret");
    var timestamp = new Date(Date.now());

    // round to nearest 30 seconds
    timestamp.setSeconds(timestamp.getSeconds() + 30);
    timestamp.setSeconds(0);

    //console.log(timestamp);

    // hash timestamp
    hmac.update(TOTP_SECRET + timestamp.toString());
    let hash = hmac.digest("hex");
    //console.log(hash);

    // get first 6 digits from hash
    let token = "";
    for (let i = 0; i < hash.length; i++) {
        // if digit is numeric, add to token
        if (/^\d+$/.test(hash[i]))
            token += hash[i];
        if (token.length >= 6)
            break;
    }

    // get token from body
    if (body["totp_token"] === token) {
        let userData = "SELECT * FROM users WHERE username=" + body["username"] + ";";
        let jwtoken = jwt.sign(userData, JWTSECRET);
        console.log("Sent JWT: " + jwt);
        response.status(200).send(jwtoken);
    }
    else {
        response.status(401).send("Invalid TOTP Token: Comparison failed.");
    }
})




app.post("/login", function (request, response) {
    // first, use username-password authentication
    console.log(request["body"])
    let body = request["body"]
    let sqlQuery = "SELECT * FROM users WHERE username='" + body["username"] + "';"
    connection.query(sqlQuery, [true], (error, results, fields) => {
        console.log("SQL Query Result: " + results);
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
console.log(`[server-users] Running on http://${HOST}:${PORT}`);
