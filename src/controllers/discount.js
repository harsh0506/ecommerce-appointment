const { Cart, User, Product, Discount, Address, Order } = require("../Models");

exports.Create = async (req, res) => {
  try {
    const { percentage, startDate, endDate, code, productId } = req.body;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    // Calculate the discounted price
    const realPrice = product.price;
    const discountedPrice = realPrice * (1 - percentage / 100);

    // Create the discount
    const discount = new Discount({
      percentage,
      startDate,
      endDate,
      code,
      productId,
      realPrice,
      discountedPrice,
    });

    // Save the discount
    await discount.save();

    // Add the discount to the product's discounts array
    product.discount.push(discount._id);
    await product.save();

    res.json(discount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.GetProdDiscount = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the discounts
    const discounts = await Discount.find({ productId });

    res.json(discounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.GetDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id).populate(
      "productId"
    );
    if (!discount) {
      return res.status(404).json({ error: "Discount not found" });
    }
    res.json(discount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.GetDiscountUsingCode = async (req, res) => {
  try {
    const { code, productId } = req.params;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    // Get the discount
    const discount = await Discount.findOne({ code, productId });
    if (!discount) {
      return res.status(400).json({ error: "Discount not found" });
    }

    // Calculate the discounted price
    const realPrice = product.price;
    const { percentage } = discount;
    const discountedPrice = realPrice - (realPrice * percentage) / 100;

    res.json({ realPrice, discountedPrice, product, discount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.ChangeDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage, startDate, endDate, code } = req.body;

    // Check if the discount exists
    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(400).json({ error: "Discount not found" });
    }

    // Get the related product
    const product = await Product.findById(discount.productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    // Update the discount
    Object.assign(discount, {
      percentage: percentage || discount.percentage,
      startDate: startDate || discount.startDate,
      endDate: endDate || discount.endDate,
      code: code || discount.code,
      discountedPrice:
        discount.realPrice -
        (discount.realPrice * (percentage || discount.percentage)) / 100,
    });

    await discount.save();

    res.json(discount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.DeleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the discount exists
    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(400).json({ error: "Discount not found" });
    }

    // Remove the discount from the product's discounts array
    const product = await Product.findById(discount.productId);
    product.discount = product.discount.filter((d) => d.toString() !== id);
    await product.save();

    // Delete the discount
    await Discount.findByIdAndDelete(id);

    res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
