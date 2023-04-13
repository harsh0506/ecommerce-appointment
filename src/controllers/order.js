const { Cart, User, Product, Discount, Address, Order } = require("../Models");

exports.Create = async (req, res) => {
  try {
    const { userId, products } = req.body;
    console.log(products);
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fetch the user's address from their schema
    const address = await Address.findById(user.address);
    if (!address) {
      return res.status(404).send("Address not found");
    }

    // Calculate the total price of the order
    let totalPrice = 0;
    for (const p of products) {
      const productData = await Product.findById(p.product);
      if (!productData) {
        return res.status(404).send(`Product ${p.product} not found`);
      }
      totalPrice += productData.price * p.quantity;
    }

    // Create the order
    const order = new Order({
      user: userId,
      address: user.address,
      products,
      totalPrice: totalPrice,
      status: "pending",
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.Put = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { payment_Method, products, aDate } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId).populate("products.product");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Update payment method if provided
    if (payment_Method) {
      order.paymentDetails.paymentMethod = payment_Method;
    }

    if (products) {
      // Iterate through the products and update their quantity
      products.forEach((item) => {
        const existingItem = order.products.find(
          (i) => i.product._id.toString() === item.product.toString()
        );

        if (existingItem) {
          // Update quantity if item already exists in the order
          existingItem.quantity = item.quantity;
          console.log("existing");
        } else {
          // Add new item if it doesn't exist in the order
          order.products.push(item);
          console.log("new");
        }
      });

      // Calculate the total price of the order

      order.products.forEach((item) => {
        const productPrice = item.product.price ? item.product.price : 0;
        order.totalPrice += productPrice * item.quantity;
      });
    }

    if (isNaN(order.totalPrice)) {
      return res.status(400).json({ msg: "Invalid total price" });
    }

    console.log(order.totalPrice);

    // Save the updated order
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.GetUsingId = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate(
      "products.product"
    );
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.SingleORder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "products.product"
    );
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(500).send("Server Error");
  }
};

exports.DelPRod = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { productId } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Find the product to be deleted from the products array
    const productToDelete = order.products.find(
      (product) => product.product.toString() === productId.toString()
    );

    if (!productToDelete) {
      return res.status(404).json({ msg: "Product not found in the order" });
    }

    // Remove the product from the products array
    order.products.pull(productToDelete);

    // Update the total price of the order
    order.totalPrice -=
      productToDelete.product.price * productToDelete.quantity;

    // Save the updated order
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
