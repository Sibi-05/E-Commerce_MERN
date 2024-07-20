import jwt from "jsonwebtoken";
import { createError } from "../error.js";

export const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(createError(404, "User Not Authenticated!"));
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(createError(404, "User Not Authenticated!"));
    }
    const decode = jwt.verify(token, process.env.KEY, (err, user) => {
      if (err) {
        return next(createError(403, "Token is not valid!"));
      }
      req.user = user;
      next();
    });
    req.user = decode;
  } catch (error) {
    next(error);
  }
};
