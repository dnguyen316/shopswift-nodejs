"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

/**
 * Function to be used for select data -> convert array to object
 * @example ['a', 'b'] => [a: 1, b: 1]
 * @param {Array} select
 * @returns {Object}
 */
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

/**
 * Function to be used for unselect data -> convert array to object
 * @example ['a', 'b'] => [a: 0, b: 0]
 * @param {Array} select
 * @returns {Object}
 */
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
};
