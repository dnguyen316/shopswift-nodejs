// This file just only use for handling with the network

const app = require("./src/app");

const PORT = process.env.DEV_APP_PORT || 3056;

const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce start with ${PORT}`);
});

// handling the gesture Ctrl + C: Exit the server
process.on("SIGINT", () => {
  server.close(() => console.log(`Exit Server Express`));
});
