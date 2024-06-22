"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

/**
 * Function to be used for select data when it was retrieved from database -> convert array to object
 * @example ['a', 'b'] => [a: 1, b: 1]
 * @param {Array} select
 * @returns {Object}
 */
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

/**
 * Function to be used for unselect data when it was retrieved from database  -> convert array to object
 * @example ['a', 'b'] => [a: 0, b: 0]
 * @param {Array} select
 * @returns {Object}
 */
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null) {
      delete obj[k];
    }
  });

  return obj;
};

/**
 * Function to convert the nested object to the object with string have dots in between deeper child property for reference
 * @example const object {
 *  a: {
 *    b: 1,
 *    c: {
 *      d: 2,
 *      e: 3
 *    }
 *  }
 * }
 *
 * If we would have
 *  db.collection.updateOne({
 *    'a.b': 1,
 *    'a.c.d': 2,
 *    'a.c.e': 3
 *  })
 *
 * @param {Object} obj
 * @returns {Object}
 */

const updateNestedObjectParser = (obj) => {
  const final = {};

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = obj[k];
    }
  });
  console.log(`[2]::`, final);
  return final;
};

const convertToObjectIdMongoDB = (id) => new Types.ObjectId(id);

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongoDB,
};
