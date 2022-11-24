const bodyParser = require("body-parser");
const express = require("express");
const PORT = 5000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    //home page will include here
    res.render("home");
});

app.get("/login", (req, res) => {
    //login page will include here
    res.render("auth/login");
});
app.get("/signup", (req, res) => {
    res.render("auth/signup");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});