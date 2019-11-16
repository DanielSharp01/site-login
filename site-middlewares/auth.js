const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function checkToken(req) {
  if (req.cookies.token) {
    try {
      let decoded = jwt.verify(req.cookies.token, process.env.SECRET);
      if (decoded) return { authed: true, withCookie: true, userId: decoded.id };
    } catch (err) {}
  }
  else if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length == 2 && /^Bearer$/i.test(parts[0])) {
      try {
        let decoded = jwt.verify(parts[1], process.env.SECRET);
        if (decoded) return { authed: true, withCookie: false, userId: decoded.id };
      } catch (err) {}
    } 
  }
  return { authed: false };
}

function refreshCookie(req, res) {
  res.cookie("token", req.cookies.token, { maxAge: 4 * 60 * 60 * 1000, overwrite: true });
}

module.exports = (setRedirect = true, redirect = true) => (req, res, next) => {
  const { authed, userId, withCookie } = checkToken(req);
  req.authed = authed;
  if (req.authed) {
    req.userId = new mongoose.Types.ObjectId(userId);;
    if (withCookie) refreshCookie(req, res);
    return next();
  } else {
    if (setRedirect && req.session) req.session.redirectUrl = req.originalUrl;
    if (redirect) res.redirect("/login");
    else return next();
  }
};
