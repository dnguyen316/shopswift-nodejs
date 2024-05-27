"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
// const crypto = require("crypto");
// In NodeJS ver.19+ also include crypto
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "0001",
  WRITER: "0002",
  EDITOR: "0003",
  ADMIN: "0004",
};

class AccessService {
  /**
   * Function handle checking that refresh token used or not. If it's used, checking the user information
   * @param {String} refreshToken
   */

  static handleRefreshToken = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    console.log(`[2]---`, userId, email);

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Forbidden Access! Please re-login again");
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError("Shop not registered");

    //check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    //create new token
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    //update new token
    const updateResult = await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    console.log("[3]--", updateResult);

    return {
      user,
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const deleteKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ deleteKey });
    return deleteKey;
  };

  /**
   * Login Service
   * 1 - check email in dbs
   * 2 - match password
   * 3 - create accessToken vs refreshToken and save
   * 4 - generate tokens
   * 5 - get data return login
   */

  static login = async ({ email, password, refreshToken = null }) => {
    // step 1
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    // step 2
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication Error");

    // step 3: create privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const { _id: userId } = foundShop;

    // step 4: generate tokens
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    /* Step1: check email exist?
     * Using lean() method to optimize performance.
     * Unless use lean(), it will return mongoose's object and the size would bigger than upto 30 times.
     * With lean(), it would be return js object
     */
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey

      // Public key CryptoGraphy Standards !
      /**
       * RSA Algorithm for Sign-up Service
       * This approach would be use for complex and robust secure in big system such as Google Cloud or Amazon
       * with this way, we would create the publicKeyString and store it on DB and just only it (doesn't have the private key and the DB as well).
       * using this method: publicKeyObject = crypto.createPublicKey(publicKeyString) to convert publicKeyObject and then pass it to function createTokenPair instead of normal public key
       */
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      /**
       * This approach below would be more simplifier for small e-commerce project
       */
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); //save to collection KeyStore
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("KeyStore Error");
      }

      // const publicKeyObject = crypto.createPublicKey(publicKeyString);
      // console.log(`publicKeyObject::`, publicKeyObject);

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
