import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../error.js";
import User from "../models/User.js";
import Orders from "../models/Orders.js";

dotenv.config();

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, "The Email Already Exisited!"));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpassword = bcrypt.hashSync(password, salt);
    const user = new User({ name, email, password: hashedpassword, img });
    const createdUser = user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.KEY, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  console.log(req.user);
  try {
    const { email, password } = req.body;
    console.log(email);
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(createError(404, "user not found"));
    }
    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }
    const token = jwt.sign({ id: existingUser._id }, process.env.KEY, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user: existingUser });
  } catch (error) {
    return next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    console.log(user);
    const existingcartItemIndex = user.cart.findIndex((item) =>
      item?.product?.equals(productId)
    );
    if (existingcartItemIndex !== -1) {
      user.cart[existingcartItemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    return res.status(200).json({ message: "Item Added To The Cart!", user });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const productIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );

    if (productIndex !== -1) {
      if (quantity && quantity > 0) {
        // Ensure quantity is a number and not NaN
        const newQuantity = parseInt(quantity); // Parse quantity to integer

        if (!isNaN(newQuantity)) {
          // Check if newQuantity is not NaN
          user.cart[productIndex].quantity -= newQuantity;

          if (user.cart[productIndex].quantity <= 0) {
            user.cart.splice(productIndex, 1);
          }
        } else {
          return next(createError(400, "Invalid quantity format"));
        }
      } else {
        user.cart.splice(productIndex, 1);
      }

      await user.save();
      return res
        .status(200)
        .json({ message: "Product quantity updated in cart", user });
    } else {
      return next(createError(404, "Product not found in the user's cart"));
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCartItem = async (req, res, next) => {
  try {
    const userJWT = req.user;
    const user = await User.findById(userJWT.id).populate({
      path: "cart.product",
      model: "Products",
    });
    const cartItems = user.cart;
    return res.status(200).json({ cartItems });
  } catch (error) {}
};

export const placeOrder = async (req, res, next) => {
  try {
    const { products, address, totalAmount } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    const order = new Orders({
      products,
      user: user._id,
      total_amount: totalAmount,
      address,
    });
    await order.save();
    user.cart.save();
    user.cart = [];
    user.cart.save();

    res.status(200).json({ message: "Order Placed Sucessfully!" });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const userJWT = req.user;
    const orders = await Orders.findById(userJWT.id);
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const addToFavourites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    console.log("Received productId:", productId);
    if (!user.favourites.includes(productId)) {
      user.favourites.push(productId);
      await user.save();
    }
    return res
      .status(200)
      .json({ message: "product Added To Favorites! ", user });
  } catch (error) {
    next(error);
  }
};

export const removeFromFavourites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userJWT = req.user;
    console.log(userJWT);
    const user = await User.findById(userJWT.id);

    user.favourites = user.favourites.filter((fav) => !fav.equals(productId));
    await user.save();
    return res
      .status(200)
      .json({ message: "product Removed From Favorites! ", user });
  } catch (error) {
    next(error);
  }
};

export const getUserFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("favourites").exec();
    if (!user) {
      return next(createError(404, "User Not Found!"));
    }
    res.status(200).json(user.favourites);
  } catch (error) {
    next(error);
  }
};
