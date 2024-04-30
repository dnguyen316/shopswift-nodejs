"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
// const crypto = require("crypto");
// In NodeJS ver.19+ also include crypto
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
  SHOP: "0001",
  WRITER: "0002",
  EDITOR: "0003",
  ADMIN: "0004",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      /* Step1: check email exist?
       * Using lean() method to optimize performance.
       * Unless use lean(), it will return mongoose's object and the size would bigger than upto 30 times.
       * With lean(), it would be return js object
       */
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: "xxxx",
          message: "Shop already registered!",
        };
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
          return {
            code: "xxxx",
            message: "keyStore error",
          };
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
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
