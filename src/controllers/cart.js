const { Cart, User, Product } = require("../Models");
const { body, param, validationResult } = require("express-validator");

exports.Create = async (req, res) => {
  const userId = req.params.userId;
  const productId = req.body.productId;
  const quantity = req.body.quantity || 1;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if a cart already exists for the user
    let cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    if (!cart) {
      // Create a new cart for the user
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity: quantity }],
      });
      await cart.save();
      await User.findByIdAndUpdate(
        userId,
        { $set: { cart: cart._id } },
        { new: true }
      );
      return res.status(200).send("Created cart and Product added to cart");
    }

    // Check if the product already exists in the cart
    const productIndex = cart.products.findIndex(
      (p) => p.product.id === productId
    );
    if (productIndex !== -1) {
      // Update the quantity of the existing product in the cart
      cart.products[productIndex].quantity += quantity;
    } else {
      if (cart.products.length <= 5) {
        cart.products.push({ product: productId, quantity: quantity });
      } else {
        res.status(400).send("Cart is full");
      } // Add the product to the cart with the specified quantity
    }

    await cart.save();
    return res.status(200).send("the quantity updated succesfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

exports.GetOrder = async (req, res) => {
  // Check if there are any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.params.userId;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User does not exist");
    }

    // Get the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products",
      populate: { path: "product", model: "Product" },
    });

    if (!cart) {
      return res.status(404).send("Cart does not exist");
    }

    res.status(200).json(cart);
  } catch (error) {
    // Handle exceptions
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.Delete = async (req, res) => {
  const { cartId, productId } = req.params;
  try {
    // Find the cart with the given cartId
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).send("Cart not found");
    }
    // Find the index of the product with the given productId in the products array
    const index = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    if (index === -1) {
      return res.status(404).send("Product not found in cart");
    }
    // Remove the product from the products array
    cart.products.splice(index, 1);
    // Save the updated cart
    await cart.save();
    res.status(200).send("Product deleted from cart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
