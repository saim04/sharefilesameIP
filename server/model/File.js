const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  originalname: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("file", FileSchema);
