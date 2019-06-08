const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOCONN.replace("<APP>", "login"), { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
