CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    passhash VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users VALUES(
    "user",
--    "$2a$12$SKkioO1xnPt9k88OBuz8x.GawzVFH5M.YzrUpUHoHfPhBq7xEcwa.",
    "$2b$12$zR16Y8k6jmLbAgVJt./3We3q96g4ESqkelo.MxcizxoNaH0oBOh7S",
    "user@example.com"
);
