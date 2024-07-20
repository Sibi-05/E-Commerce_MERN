import mongoose from "mongoose";
import Products from "../models/Products.js";
import { createError } from "../error.js";

export const addProducts = async (req, res, next) => {
  try {
    const productsData = req.body;
    if (!Array.isArray(productsData)) {
      return next(createError(400, "Invalid Request!"));
    }

    const createdproducts = [];

    for (const productInfo of productsData) {
      const { title, name, desc, img, price, sizes, category } = productInfo;
      const product = new Products({
        title,
        name,
        desc,
        img,
        price,
        sizes,
        category,
      });
      const createdproduct = await product.save();
      createdproducts.push(createdproduct);
    }
    return res
      .status(201)
      .json({ message: "Products Added Sucessfully!", createdproducts });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    let { categories, minPrice, maxPrice, sizes, search } = req.query;
    sizes = sizes?.split(",");
    categories = categories?.split(",");
    const filter = {};
    if (categories && Array.isArray(categories)) {
      filter.category = { $in: categories };
    }
    if (minPrice || maxPrice) {
      filter["price.org"] = {};
      if (minPrice) {
        filter["price.org"]["$gte"] = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter["price.org"]["$lte"] = parseFloat(maxPrice);
      }
    }
    if (sizes && Array.isArray(sizes)) {
      filter.sizes = { $in: sizes };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { desc: { $regex: new RegExp(search, "i") } },
      ];
    }
    const products = await Products.find(filter);
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return next(createError(400, "Invalid Product Id!"));
    }
    const product = await Products.findById(id);
    if (!product) {
      return next(createError(400, "The  Product  Not Found!"));
    }
    res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
};
