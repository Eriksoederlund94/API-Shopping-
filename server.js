// Init Express
const express = require("express");
const app = express();

// JSON
app.use(express.json());

// Server port
const PORT = 8000;

// Init Lowdb
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

// Adapter
const adapter = new FileSync("database.json");
const database = low(adapter);

// Import
const shoppingData = require("./app");
const productNumber = require("./function");

// INIT database
function initDatabase() {
  database.defaults(shoppingData).write();
}

// Get all products
app.get("/all-products", (req, res) => {
  const productsData = database.get("products").value();
  res.json(productsData);
});

// Get the cart
app.get("/cart/all", (req, res) => {
  const cartData = database.get("cart").value();
  res.json(cartData);
});

// Delete products from cart
app.delete("/all/delete/:id", (req, res) => {
  const productId = req.params.id;
  const numberId = parseInt(productId);
  const cartData = database.get("cart").value();
  const cartIndex = cartData.find(function (cartId) {
    if (cartId.id === numberId) {
      return true;
    } else {
      return false;
    }
  });

  if (cartIndex) {
    database.get("cart").remove({ id: numberId }).write();
    res.json({ msg: "Item deleted!", Cart: cartData });
  } else {
    res.json({ msg: "There is no items with that id!" });
  }
});

// Add products to cart!
app.post("/cart/add/:id", (req, res) => {
  const productId = req.params.id; // Variablen är lika med parametren
  const numberId = parseInt(productId); // Gör om till number

  // Utförs endast om parametern är mindre än prodctNumber
  if (numberId < productNumber) {
    const productsData = database.get("products").value(); // Hämtar data från producter!
    const addToCart = productsData[numberId]; // Producter index kopplat till parametern
    database.get("cart").push(addToCart).write(); // Pushar product index till cart!
    replaceDuplicates(); // Init stoppar så att man inte han ha dubbla producter!

    const cartData = database.get("cart").value(); // Hämtar data från cart!
    res.json(cartData); // Response datan i JSON
  } else {
    res.json({ msg: "That product does not exist!" });
  }
});

// Server
app.listen(PORT, () => {
  console.log(`Server started! Listening on port ${PORT}!`);
  initDatabase(); // Init Database function
});

// Gör så att man inte kan lägga till fler av samma product!
function replaceDuplicates() {
  const newCart = database.get("cart").uniqBy("name").value();
  database.set("cart", newCart).write();
}
