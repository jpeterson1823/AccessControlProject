const express = require("express");
const mysql = require("mysql2");
const cors = require("cors")



const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);

const SQL = "SELECT * from things;"

const app = express();
app.use(express.json());
app.use(cors());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: MYSQLDB
});



app.use("/", express.static("frontend", { index : "login.html" }));
//app.set('view engine', 'ejs')



app.get("/query", function (request, response) {
    // get request body and parse data
    var jwt = request.headers.authorization
    console.log('[query] jwt : ' + jwt)

    fetch ('http://server-users/validateToken', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        mode : 'cors',
        body: JSON.stringify({jwt : jwt})
    })
    .then((res) => {
        if (res.ok) {
            connection.query(SQL, [true], (error, results, fields) => {
                if (error) {
                    console.error(error.message);
                    response.status(500).send("database error");
                } else {
                    console.log(results);
                    response.send(results);
                }
            });
        } else {
            console.log('[query] Invalid JWT')
            console.log(res)
            response.status(401).send("Invalid JWT")
        }
    })

})


app.listen(PORT, HOST);
console.log(`[server-data] Running on http://${HOST}:${PORT}`);
