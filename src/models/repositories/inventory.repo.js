const { convertToObjectIdMongoDB } = require("../../utils");
const { inventory } = require("../inventory.model");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}) => {
  return await inventory.create({
    productId,
    shopId,
    stock,
    location,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      productId: convertToObjectIdMongoDB(productId),
      stock: {
        $gte: quantity,
      },
    },
    updateSet = {
      $inc: {
        stock: -quantity,
      },
      $push: {
        reservations: {
          quantity,
          cartId,
          createdAt: new Date(),
        },
      },
    },
    option = { upsert: true, new: true };

  return await inventory.updateOne(query, updateSet);
};

module.exports = {
  insertInventory,
  reservationInventory,
};
