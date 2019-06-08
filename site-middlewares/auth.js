const url = require("url");
const jwt = require("jsonwebtoken");

function checkToken(req) {
  if (req.cookies.token) {
    try {
      let decoded = jwt.verify(req.cookies.token, process.env.SECRET);
      if (decoded) return true;
    } catch (err) {}
  }
  return false;
}

module.exports = (setRedirect = true) => (req, res, next) => {
  let authed = checkToken(req);
  if (authed) {
    return next();
  } else {
    req.formatUrl = url.format({
      protocol: req.protocol,
      host: req.get("host"),
      pathname: req.originalUrl
    });
    if (setRedirect && req.session) req.session.redirectUrl = req.formatUrl;
    res.redirect("/login");
  }
};
