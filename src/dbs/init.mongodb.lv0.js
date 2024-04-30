"use strict";

const mongoose = require("mongoose");

const connectString =
  "mongodb+srv://dnguyen316:b2GlZUSd47kYNqvE@dev-shopswift.a0z5myd.mongodb.net/?retryWrites=true&w=majority&appName=dev-shopswift";

mongoose
  .connect(connectString)
  .then((_) => console.log(`Connected Mongodb Success`))
  .catch((err) => console.log(`${err} Error Connect`));

// dev
if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
