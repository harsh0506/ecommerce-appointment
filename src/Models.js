const mongoose = require("mongoose");

// Create a schema for the product table
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  use: String,
  alternate: String,
  sideEffect: String,
  therapeuticClass: String,
  discount: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
  ],
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
  },
});

ProductSchema.index({
  name: "text",
  description: "text",
  use: "text",
  therapeuticClass: "text",
});

var InventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  lastStocked: {
    type: Date,
    required: true,
    default: Date.now,
  },
  discounts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
  ],
});

// Create a schema for the user table
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image:{
    type: String,
  },
  phoneNumber:{
    type:Number
  },
  age:{
    type:Number
  },
  role:{
    type : String,
   
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
});

// Create a schema for the address table
const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create a schema for the wishlist table
const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

// Create a schema for the cart table
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
});

const DiscountSchema = new mongoose.Schema({
  percentage: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  realPrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
    },
    paymentDetails: {
      default: {},
      type: {
        paymentMethod: {
          type: String,
          default: "COD",
          enum: ["COD", "CreditCard", "DebitCard", "NetBanking", "UPI"],
        },
        transactionId: {
          type: String,
          default: null,
        },
      },
    },
    trackingId: {
      type: String,
    },
    approximateDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Export the schemas as models
module.exports.Product = mongoose.model("Product", ProductSchema);
module.exports.Inventory = mongoose.model("Inventory", InventorySchema);
module.exports.User = mongoose.model("User", UserSchema);
module.exports.Address = mongoose.model("Address", AddressSchema);
module.exports.Wishlist = mongoose.model("Wishlist", WishlistSchema);
module.exports.Cart = mongoose.model("Cart", CartSchema);
module.exports.Discount = mongoose.model("Discount", DiscountSchema);
module.exports.Order = mongoose.model("Order", OrderSchema);
