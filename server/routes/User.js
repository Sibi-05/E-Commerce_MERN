import express from "express";
import {
  UserRegister,
  addToCart,
  addToFavourites,
  getAllCartItem,
  getAllOrders,
  getUserFavourites,
  placeOrder,
  removeFromCart,
  removeFromFavourites,
} from "../controllers/User.js";
import { UserLogin } from "../controllers/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", UserRegister);
router.post("/signin", UserLogin);

//cart
router.get("/cart", verifyToken, getAllCartItem);
router.post("/cart", verifyToken, addToCart);
router.patch("/cart", verifyToken, removeFromCart);

//order
router.get("/order", verifyToken, getAllOrders);
router.post("/order", verifyToken, placeOrder);

//favourites
router.post("/favourite", verifyToken, addToFavourites);
router.get("/favourite", verifyToken, getUserFavourites);
router.patch("/favourite", verifyToken, removeFromFavourites);

export default router;
