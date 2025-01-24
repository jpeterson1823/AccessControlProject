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
const SQL_LOTTERY = "SELECT * from lottery;"

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
        if (res.status == 200) {
            console.log('[query()] JWT token validated.')
            connection.query(SQL, [true], (error, results, fields) => {
                if (error) {
                    console.error(error.message);
                    response.status(500).send("database error");
                } else {
                    res.json().then((jwtDecoded) => {
                        console.log("[query()] Decoded JWT: " + JSON.stringify(jwtDecoded))
                        console.log("[query()] "+ JSON.stringify(results));
                        response.send(results);
                    })
                }
            });
        } else {
            console.log('[query] Invalid JWT')
            console.log(res)
            response.status(401).send("Invalid JWT")
        }
    })

})


app.get("/queryLottery", function (request, response) {
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
        if (res.status == 200) {
            console.log('[query()] JWT token validated.');
            res.json().then((userData) => {
                if (userData.role === "poweruser") {
                    console.log('[queryLotto()] User has poweruser role. Continuing to process query.')
                    connection.query(SQL_LOTTERY, [true], (error, results, fields) => {
                        if (error) {
                            console.error(error.message);
                            response.status(500).send("database error");
                        } else {
                                console.log("[query()] Decoded JWT: " + JSON.stringify(userData));
                                // only send lotty data if they are "poweruser"
                                //console.log("[query()] "+ JSON.stringify(results));
                                response.send(results);
                        }
                    });
                }
                else {
                    console.log('[queryLotto()] User does not have poweruser role. Denying query request.');
                    console.log('[queryLotto()]     provided role: ' + userData.role);
                    response.status(401).send("Access Denied: Improper User Role");
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
