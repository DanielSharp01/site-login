const mongoose = require("mongoose");
module.exports = mongoose.createConnection(process.env.MONGOCONN.replace("<DB>", "accounts"), {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
