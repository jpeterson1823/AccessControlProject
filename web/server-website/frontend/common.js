var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        mode: "no-cors",
        //mode: "cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

function login() {
    // get user data from input fields and put then in a JSON object
    let data = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    })
    console.log("Frontend: " + data)

    // send POST to backend/login for login handling
    fetch ("http://" + parsedUrl.host + ":3000/login", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        //mode: "no-cors",
        mode: "cors",
        body: data
    })
    .then((resp) => {
        if (resp.ok) {
            // store cookie with username in browser
            document.cookie = "username=" + data["username"];
            window.location.href = "totp.html"
            console.log(resp.data)
        } else if (resp.status == 401) {
            alert("Username or password is incorrect");
        } else if (resp.status == 500) {
            alert("Server Error");
        } else {
            alert("Unknown Error");
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

function totp() {
    let data = JSON.stringify({
        totp_token: document.getElementById("totp_token").value,
        username: document.cookie["username"]
    })

    fetch ("http://" + parsedUrl.host + ":3000/totp", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Access-Control-Allow-Origin" : "http://" + parsedUrl.host + ":3000"
        },
        mode: "no-cors",
        body: data
    })
    .then((resp) => {
        if (resp.ok) {
            document.cookie = "username=" + document.cookie["username"] +"; jwt=" + resp.data;
            window.location.href = "query.html"
            console.log("Current Cookie: " + document.cookie);
        } else if (resp.status == 401) {
            alert("TOTP Token is not correct.");
            window.location.href = "login.html"
        } else if (resp.status == 500) {
            alert("Server Error");
        } else {
            alert("Unknown Error");
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

