var parsedUrl = new URL(window.location.href);

function query() {
    let cookie = parseCookieTotp();

    fetch('http://' + parsedUrl.host + '/query', {
        method: 'GET',
        headers: {
            'Authorization' : cookie['jwt']
        },
        mode: 'cors',
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById('response').innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

function queryLottery() {
    let cookie = parseCookieTotp();

    fetch('http://' + parsedUrl.host + '/queryLottery', {
        method: 'GET',
        headers: {
            'Authorization' : cookie['jwt']
        },
        mode: 'cors',
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById('response').innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

function login() {
    //let data = JSON.stringify({
    //    username: document.getElementById('username').value,
    //    password: document.getElementById('password').value,
    //})
    // get user data from input fields and put then in a JSON object
    let data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    }
    console.log('Frontend: ' + data['username'])

    // send POST to backend/login for login handling
    fetch ('http://' + parsedUrl.host + ':3000/login', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        //mode: 'no-cors',
        mode: 'cors',
        body: JSON.stringify(data)
    })
    .then((resp) => {
        if (resp.ok) {
            // store cookie with username in browser
            document.cookie = 'acptotp=' + JSON.stringify({ username: data['username'] })
            window.location.href = 'totp.html'
            console.log(resp.data)
        } else if (resp.status == 401) {
            alert('Username or password is incorrect');
        } else if (resp.status == 500) {
            alert('Server Error');
        } else {
            alert('Unknown Error');
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

function parseCookieTotp() {
    let parsed;
    document.cookie.split(';').forEach((cookie) => {
        //console.log('[parseCookieTotp()] cookie = ' + cookie)
        if (cookie.startsWith("acptotp")) {
            parsed = cookie.split('=')[1];
        }
    })
    return JSON.parse(parsed);
}

function updateCookieTotp(data) {
    console.log('[updateCookieTotp()] new data: ' + JSON.stringify(data))
    document.cookie = 'acptotp=' + JSON.stringify(data)
}

function totp() {
    // parse totp data from cookie
    let totpData = parseCookieTotp();
    console.log('totpData = ' + JSON.stringify(totpData))

    let data = JSON.stringify({
        totp_token: document.getElementById('totp_token').value,
        username: totpData['username']
    })

    fetch ('http://' + parsedUrl.host + ':3000/totp', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        mode: 'cors',
        body: data
    })
    .then((resp) => {
        if (resp.ok) {
            resp.text().then((jwtString) => {
                totpData["jwt"] = jwtString;
                updateCookieTotp(totpData);
                //console.log("new totp data: " + JSON.stringify(totpData))
                //console.log('Current Cookie: ' + document.cookie);
                window.location.href = 'query.html'
            })
        } else if (resp.status == 401) {
            alert('TOTP Token is not correct.');
            window.location.href = 'login.html'
        } else if (resp.status == 500) {
            alert('Server Error');
        } else {
            alert('Unknown Error');
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

