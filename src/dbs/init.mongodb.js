"use strict";

const mongoose = require("mongoose");

const {
  db: { host, name, port },
} = require("../configs/config.mongodb");

const connectString = `mongodb+srv://${host}:${port}/?retryWrites=true&w=majority&appName=${name}`;
const { countConnect } = require("../helpers/check.connect");

/**
 * Apply singleton pattern to create connection to db just in first time
 * and every calling later would be call the instance of it
 */

class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = "mongodb") {
    // dev env
    if (1 === 1) {
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString)
      .then((_) => console.log(`Connected Mongodb Success`), countConnect())
      .catch((err) => console.log(`${err} Error Connect`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
