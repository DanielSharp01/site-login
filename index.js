const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connection = require("./db");
const User = require("./User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const port = 3101;
const app = express();

const auth = require("./site-middlewares/auth");
const MongoSessionStore = require("connect-mongo")(session);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoSessionStore({ mongooseConnection: connection })
  })
);
app.use(cookieParser());

function consumeRedirectUrl(req) {
  let url = req.session.redirectUrl;
  delete req.session.redirectUrl;
  return url;
}

app.use("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.redirect("/login");
});

app.get("/login/", auth(false, false), (req, res) => {
  res.setHeader("Content-Type", "text/html");
  if (req.authed) res.send(fs.readFileSync(path.join(__dirname, "public/logged-in.html"), "utf8"));
  else res.send(fs.readFileSync(path.join(__dirname, "public/index.html"), "utf8"));
});

app.use("/login", express.static("public"));

app.post("/register", (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      res.status(400).send();
      return;
    }
    let user = new User();
    user.username = req.body.username;
    bcrypt.hash(req.body.password, 10, async function(err, hash) {
      user.password = hash;
      user.permissions = req.body.permissions || [];
      await user.save();
      res.status(200).send();
    });
  } catch (err) {
    res.status(500).send();
    console.error(err);
  }
});

app.post("/login/validate", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send();
    return;
  }
  try {
    let user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(200).send("false");
      return;
    }
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) res.status(200).send("true");
      else res.status(200).send("false");
    });
  } catch (err) {
    res.status(500).send();
    console.error(err);
  }
});

app.post("/login/actual", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send();
    return;
  }
  try {
    let user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(401).send();
      return;
    }
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) {
        let token = jwt.sign({ id: user._id }, process.env.SECRET);
        res.cookie("token", token, { maxAge: 24 * 7 * 4 * 60 * 60 * 1000, httpOnly: true }); // 4 week expiry
        res.redirect(consumeRedirectUrl(req) || "/login");
      } else res.status(401).send();
    });
  } catch (err) {
    res.status(500).send();
    console.error(err);
  }
});

app.post("/login/api", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send();
    return;
  }
  try {
    let user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(401).send();
      return;
    }
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) {
        let token = jwt.sign({ id: user._id }, process.env.SECRET);
        res.status(200).send(token);
      } else res.status(401).send();
    });
  } catch (err) {
    res.status(500).send();
    console.error(err);
  }
});

app.listen(port, "localhost", () => console.log(`Listening on port ${port}!`));
