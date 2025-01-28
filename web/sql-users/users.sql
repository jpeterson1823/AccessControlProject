CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    passhash VARCHAR(255) NOT NULL,
    salt     VARCHAR(4)   NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username),
    role     ENUM('default', 'poweruser')
);

INSERT INTO users VALUES(
    "user",
    "$2b$12$jh8qi.Ocu/eNX6rU0ugbr.ELTwn0E8ogy/RfIOcBPRMga9kdX6lo2",
    "b34n",
    "user@example.com",
    "poweruser"),
    ("one",
    "$2b$10$.DKlnqlMYSClvQrJ6smCIO3ukBYecuj02V2LJncGKjiNce/jVDbQe",
    "edc6",
    "one@example.com",
    "default");
