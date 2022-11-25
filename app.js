require("./database/database");
const User = require("./model/user");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const express = require("express");
const { validationResult } = require("express-validator");

const { body } = require("express-validator");

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
  res.render("auth/login", {
    msg: null,
    oldInput: { aname: null, email: null, pass: null },
  });
});
app.get("/signup", (req, res) => {
  res.render("auth/signup", {
    msg: null,
    oldInput: { aname: null, email: null, pass: null },
  });
});

app.post(
  "/signup",
  [
    body("name_user")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Email is not valid").normalizeEmail(),
    body("pass")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),
  ],
  (req, res) => {
    const name = req.body.name_user;
    const email = req.body.email;
    const password = req.body.pass;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("auth/signup", {
        msg: errors.array()[0].msg,
        oldInput: { aname: name, email: email, pass: password },
      });
    }

    const u = User.findOne({ email: email });
    if (u) {
      return res.render("auth/signup", {
        msg: "Email already exists",
        oldInput: { aname: name, email: email, pass: password },
      });
    }

    return bcrypt
      .hash(password, 13)
      .then((hashedpass) => {
        const u1 = new User({
          name: name,
          email: email,
          password: hashedpass,
        });
        return u1.save();
      })
      .then((result) => {
        res.redirect("/");
        //if mail sent
      });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
