const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const {createHmac} = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors')


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
const HASHPEPPER = String(process.env.HASHPEPPER);
const TOTP_SECRET = String(process.env.TOTP_SECRET);
const JWTSECRET = String(process.env.JWTSECRET);

const app = express();
app.use(cors());
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: MYSQLDB
});




app.post('/login', function (request, response) {
    // first, use username-password authentication
    let body = request['body'];
    let sqlQuery = 'SELECT * FROM users WHERE username="' + body['username'] + '";'
    connection.query(sqlQuery, [true], (error, results, fields) => {
        console.log('[login] SQL Query: ' + sqlQuery);
        console.log('[login] SQL Query Result: ' + results);
        if (error) {
            console.error('[login] SQL Error: ' + error.message);
            response.status(500).send('database error');
        } else {
            let combinedPass = results[0]['salt'] + body['password'] + HASHPEPPER;
            //console.log('COMBINED: ' + combinedPass)

            bcrypt.compare(combinedPass, results[0]['passhash'], (_, result) => {
                if (result == false) {
                    console.log('[login] Username or password not found');
                    response.status(401).send('unauthorized');
                } else {
                    console.log('[login] Login Successful')
                    response.status(200).send('Success');
                }
            });
        }
    });
})




app.post('/totp', function (request, response) {
    // first, use username-password authentication
    //console.log(request['body'])
    let body = request['body']
    console.log('[totp] request body: ' + JSON.stringify(body))

    // set up hashing and get timestamp
    const hmac = createHmac('sha256', 'a secret');
    var timestamp = new Date(Date.now());

    // round to nearest 30 seconds
    timestamp.setSeconds(timestamp.getSeconds() + 30);
    timestamp.setSeconds(0);

    // hash timestamp
    hmac.update(TOTP_SECRET + timestamp.toString());
    let hash = hmac.digest('hex');
    //console.log(hash);

    // get first 6 digits from hash
    let token = '';
    for (let i = 0; i < hash.length; i++) {
        // if digit is numeric, add to token
        if (/^\d+$/.test(hash[i]))
            token += hash[i];
        if (token.length >= 6)
            break;
    }

    // get token from body
    if (body['totp_token'] === token) {
        // get user information for JWT to encode
        connection.query('SELECT * FROM users WHERE username="' + body['username'] + '";', [true], (error, results, fields) => {
            if (error) {
                console.error('[totp] SQL Query Error! ' + error.message);
            } else {
                console.log('[totp] Obtained user data for "' + body['username'] + '": ' + JSON.stringify(results[0]));

                // encode the username and email into the JWT token and send it via response
                // send user info, excluding password hash and salt
                let userData = results[0]
                delete userData.passhash;
                delete userData.salt;
                var jwtoken = jwt.sign(userData, JWTSECRET, { expiresIn: '0.5 hrs' });
                console.log("[totp] Generated JWT: " + jwtoken)
                response.status(200).send(jwtoken);
            }
        })
        
    }
    else {
        response.status(401).send('Invalid TOTP Token: Comparison failed.');
    }
})




app.post('/validateToken', function(request, response) {
    // parse request body and extract data
    var token = request['body']['jwt']
    console.log("[validateToken] JWT Token: " + token)

    // verify the jwt
    jwt.verify(token, JWTSECRET, (err, decoded) => {
        if (err) {
            console.error('[validateToken] JWT VERIFY ERROR: ' + err.message)
            response.status(500).send("server error")
        } else {
            console.log('[validateToken] Decoded JWT: ' + JSON.stringify(decoded))
            response.status(200).send(JSON.stringify(decoded))
        }
    })
})


app.post('/logs', function (request, response) {
    console.log("LOGS ACCESSED: " + JSON.stringify(request.body));
    let token = request.headers.authorization;
    let data = request.body;

    if (!token) {
        return response.status(401).send('Unauthorized');
    }

    // check if fetching or storing data
    if (data.fetch) {
        jwt.verify(token, JWTSECRET, (err, decoded) => {
            if (err) {
                console.log("error: " + err);
                return response.status(403).send('Forbidden');
            }

            console.log("Decoded JWT: " + JSON.stringify(decoded));

            if (!(decoded.role === 'poweruser')) {
                return response.status(403).send('Insufficient permissions');
            }

            // Log the event of fetching logs
            let logQuery = 'INSERT INTO logs (log_id, username, action, success) VALUES (UUID(),"' + data.username +'","Fetched Logs",true);';
            connection.query(logQuery, [true], (err, bingus, bungus) => {
                if (err)
                    console.log("sql insert error: " + err);
            });

            // actually get the logs
            let sqlQuery = 'SELECT * FROM logs ORDER BY timestamp DESC;';
            connection.query(sqlQuery, [true], (error, results, fields) => {
                if (error) {
                    return response.status(500).send('Database error');
                }
                response.status(200).send(results);
            });
        });
    }

    else {
        let { username, action, success } = request.body;
        let sqlQuery = 'INSERT INTO logs (log_id, username, action, success) VALUES ((UUID(),"' + username +'","' + action + '","' + success + '"));';
        connection.query(sqlQuery, [username, action, success], (error, results) => {
            if (error) {
                console.error('[log] SQL Error: ' + error.message);
                response.status(500).send('database error');
            } else {
                console.log('[log] Log entry inserted.');
                response.status(200).send('Log entry added.');
            }
        });

    }
});




app.listen(PORT, HOST);
console.log(`[server-users] Running on http://${HOST}:${PORT}`);
