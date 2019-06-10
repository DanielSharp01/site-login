const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const connection = require("./db");

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: { type: [String], default: [] }
});

module.exports = connection.model("User", UserSchema);
