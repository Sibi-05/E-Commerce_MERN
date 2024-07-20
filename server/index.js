import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

import UserRouter from "./routes/User.js";
import ProductRoutes from "./routes/Products.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
  // next();
});
app.use("/api/user", UserRouter);
app.use("/api/products", ProductRoutes);
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "HELLO GUYS!",
  });
});

const connectDB = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Data Base Connected!"))
    .catch((error) => {
      console.log(error);
    });
};

const startServer = async () => {
  try {
    connectDB();
    app.listen(process.env.PORT, () =>
      console.log("server Connected Sucessfully")
    );
  } catch (error) {
    console.log(error);
  }
};
startServer();
