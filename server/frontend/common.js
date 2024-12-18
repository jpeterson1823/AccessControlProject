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
    fetch ("http://" + parsedUrl.host + "/login", {
        method: "POST",
        mode: "no-cors",
        body: {}
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.href = login.html
    })
    .catch((err) => {
        console.log(err);
    })

    body: JSON.stringify({
        username: document.getElementById("username").text,
        password: document.getElementById("password").text
    })
    .then((resp) => resp.text())
    .then((_resp) => {
        document.href = index.html
    })
    .catch((err) => {
        console.log(err);
        if (resp.status = 401) {
            alert("Username or password is incorrect");
        } else if (resp.status = 500) {
            alert("Server Error");
        } else {
            alert("Unknown Error");
        }
    })
}
