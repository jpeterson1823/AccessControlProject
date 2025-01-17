var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        mode: "no-cors",
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
    let data = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    })

    console.log("Frontend: " + data)

    fetch ("http://" + parsedUrl.host + "/login", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        //mode: "no-cors",
        body: data
    })
    .then((resp) => {
        if (resp.ok) {
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
    })

    fetch ("http://" + parsedUrl.host + "/totp", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        //mode: "no-cors",
        body: data
    })
    .then((resp) => {
        if (resp.ok) {
            window.location.href = "query.html"
            console.log(resp.data)
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

