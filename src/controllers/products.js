const { Product, Inventory } = require("../Models");

exports.GetAllProducts = async function (req, res, next) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.GetProdId = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const searchValidation = (req, res, next) => {
  const { query } = req.body;

  // check if query is provided
  if (!query) {
    return res.status(400).json({
      message: "Search query is required.",
    });
  }

  // check if query is a string and not empty
  if (typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({
      message: "Search query must be a non-empty string.",
    });
  }

  // pass validation
  next();
};

exports.Textsearch = async (req, res, next) => {
  try {
    const { searchTerm } = req.body || "aspi";
    if (!searchTerm) {
      return res.status(400).send({ message: "Search term is required" });
    }

    const pipeline = [
      {
        $search: {
          index: "default",
          text: {
            query: searchTerm,
            path: {
              wildcard: "*",
            },
            fuzzy: {},
          },
        },
      },
    ];
    const results = await Product.aggregate(pipeline);

    if (results.length === 0) {
      return res.status(404).send({ message: "No products found" });
    }

    return res.status(200).send({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server error" });
  }
};

exports.Update = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.Delete = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.Add = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    let existingInventory = await Inventory.findOne({ productId: product._id });

    if (existingInventory) {
      existingInventory.quantity += req.body.quantity;
      console.log("existed before");
      await existingInventory.save();
    } else {
      const inventory = new Inventory({
        productId: product._id,
        quantity: req.body.quantity,
        price: req.body.price,
      });

      await inventory.save();
      console.log("added newly");
    }

    res.json("product added succesfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
