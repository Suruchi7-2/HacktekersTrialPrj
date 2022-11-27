require("./database/database");
const User = require("./model/user");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const express = require("express");
const { validationResult } = require("express-validator");
const session = require("express-session");
const MongoDBstore = require("connect-mongodb-session")(session);
const { body } = require("express-validator");
const isLoggedInReq = require("./middleware/islogin");

const PORT = 5000;

const MONGODB_URI = "mongodb://localhost:27017/hacktechers";

const app = express();

//session for orgainzeer
const oSessionStore = new MongoDBstore({
  //calling constructor
  uri: MONGODB_URI,
  collection: "osession",
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(
  session({
    secret: "My secret is awsome",
    resave: false,
    saveUninitialized: false,
    store: oSessionStore,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});
//local variable
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;

  next();
});

app.get("/", (req, res) => {
  //home page will include here
  res.render("home", { user: req.user });
});

app.get("/login", (req, res) => {
  //login page will include here
  res.render("auth/login", {
    msg: null,
    oldInput: { aname: null, email: null, pass: null },
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.pass;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render("auth/login", {
      msg: validationErrors.array()[0].msg,
      oldInput: { email: email, pass: password },
    });
  }
  User.findOne({ email: email.toLowerCase() }).then((user) => {
    if (!user) {
      return res.status(422).render("auth/login", {
        msg: "Invalid email or password",
        oldInput: { email: email, pass: password },
      });
    }

    bcrypt.compare(password, user.password).then((doMatch) => {
      if (!doMatch) {
        return res.status(422).render("auth/login", {
          msg: "Invalid email or password",
          oldInput: { email: email, pass: password },
        });
      }
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        //  console.log(err);
        res.redirect("/");
      });
    });
  });
});
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    // console.log(err);
    res.redirect("/");
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

    User.findOne({ email: email }).then((user) => {
      if (user) {
        return res.render("auth/signup", {
          msg: "Email already exists",
          oldInput: { aname: name, email: email, pass: password },
        });
      }
    });

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
app.get("/blog", (req, res) => {
  res.render("blog", { user: req.user });
});

app.get("/about", (req, res) => {
  res.render("about", { user: req.user });
});
app.get("/contact", (req, res) => {
  res.render("reachus", { user: req.user });
});
app.use((req, res, next) => {
  res.status(404).render("404", { user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
