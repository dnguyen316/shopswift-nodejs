"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // const publicKeyString = publicKey.toString();

      /**
       * Basic Approach
       */
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });

      // return tokens ? tokens.publicKey : null;

      /**
       * Using
       */
      const filter = { user: userId };

      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };

      const options = { upsert: true, new: true };

      // Find in DB whether it has or not to update or create new
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {}
  };
}

module.exports = KeyTokenService;
