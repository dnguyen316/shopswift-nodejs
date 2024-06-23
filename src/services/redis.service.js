"use strict";

const redis = require("redis");
const { promisify } = require("node:util");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pExpire = promisify(redisClient.pExpire).bind(redisClient);
const setNXAsync = promisify(redisClient.setNX).bind(redisClient);

/**
 * @description This function using `Optimistic Lock` for holding a user in checkout action
 *              when there is another user acting this checkout at the same time. By retry 10 times to attempt to modify the inventory
 * @param {String} productId
 * @param {Number} quantity
 * @param {String} cartId
 * @returns null or key lock
 */

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; //3 second temporary lock
  const delayTime = 50;

  for (let i = 0; i < retryTimes; i++) {
    const result = await setNXAsync(key, expireTime);
    console.log(`result::`, result);
    if (result === 1) {
      //manipulate with inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });
      if (isReservation.modifiedCount > 0) {
        await pExpire(key, expireTime);
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, delayTime));
    }
  }
};

const releaseLock = async (keyLock) => {
  const deleteAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await deleteAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
