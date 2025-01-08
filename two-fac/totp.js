const {createHmac} = require("crypto");

const hmac = createHmac("sha256", "a secret");

var timestamp = new Date(Date.now());

// round to nearest 30 seconds
timestamp.setSeconds(timestamp.getSeconds() + 30);
timestamp.setSeconds(0);

console.log(timestamp);

// hash timestamp
hmac.update(timestamp.toString());
let hash = hmac.digest("hex");
console.log(hash);

// get first 6 digits from hash
let token = "";
for (let i = 0; i < hash.length; i++) {
    // if digit is numeric, add to token
    if (/^\d+$/.test(hash[i]))
        token += hash[i];
    if (token.length >= 6)
        break;
}

console.log(token);

// execute `sudo docker run -it --rm -v ./totp.js:/app/totp.js totp` to get hash
