import axios from "axios";

const API = axios.create({
  baseURL: "https://e-commerce-mern-q08d.onrender.com/api/",
});
console.log("Hello");
export const UserSignUp = async (data) => await API.post("/user/signup", data);
export const UserSignIn = async (data) => await API.post("/user/signin", data);

export const getAllProducts = async (filter) =>
  await API.get(`/products?${filter}`);

export const getProductDetails = async (id) => await API.get(`/products/${id}`);

//cart
export const getCart = async (token) =>
  await API.get(`/user/cart/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToCart = async (token, data) =>
  await API.post(`/user/cart/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteFromCart = async (token, data) =>
  await API.patch(`/user/cart/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
//favourite

export const getFavourite = async (token) =>
  await API.get(`/user/favourite/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToFavourite = async (token, data) =>
  await API.post(`/user/favourite/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteFromFavourite = async (token, data) =>
  await API.patch(`/user/favourite/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

//Orders

export const placeOrder = async (token, data) =>
  await API.post(`/user/order/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrder = async (token, data) =>
  await API.get(`/user/order/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
