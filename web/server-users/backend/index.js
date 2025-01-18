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
app.use(express.json());
app.use(cors());


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
                console.log('[totp] Obtained user data for "' + body['username'] + '": ' + JSON.stringify(results));

                // encode the username and email into the JWT token and send it via response
                // string is formatted as follows: username;email
                let jwtPayload = JSON.parse('{"' + results['username'] + '":"' + results['email'] + '"}');
                let jwtoken = jwt.sign(jwtPayload, JWTSECRET, { expiresIn: '0.5 hrs' });
                response.status(200).send(jwtoken);
            }
        })
        
    }
    else {
        response.status(401).send('Invalid TOTP Token: Comparison failed.');
    }
})




app.post('/validatejwt', function(request, response) {
    // parse request body and extract data
    let body = request['body'];
    let token = body['jwt']
    let username = body['username']

    // get user data from database
    let userData = getUserData(body['username']);

    // verify the jwt
    let validUserString = userData['username'] + ';' + userData['email'];
    jwt.verify(token, JWTSECRET, (err, decoded) => {
        if (err) {
            console.error(err.message())
        } else {
            console.log('Decoded JWT: ' + decoded)
        }
    })
})




app.listen(PORT, HOST);
console.log(`[server-users] Running on http://${HOST}:${PORT}`);
