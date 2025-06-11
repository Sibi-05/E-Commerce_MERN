// utils/toaster.js
import { toast, Zoom } from "react-toastify";

/**
 * Display a toast message
 * @param {'success' | 'error' | 'info' | 'warn'} type - The toast type
 * @param {string|object} message - Message or error object
 * @param {object} overrides - Optional config overrides
 */
export const Toaster = (type, message, overrides = {}) => {
  // Normalize message
  let finalMessage = "Something went wrong";
  console.log("Hello",message);

  if (typeof message === "string") {
    finalMessage = message;
  } else if (message?.response?.data?.message) {
    finalMessage = message.response.data.message;
  } else if (message?.response?.message) {
    finalMessage = message.response.message;
  } else if (message?.message) {
    finalMessage = message.message;
  } else if (typeof message?.toString === "function") {
    finalMessage = message.toString();
  }

  // Fallback to supported types
  const toastType = ["success", "error", "info", "warn"].includes(type)
    ? type
    : "info";

  // Fire toast
  toast[toastType](finalMessage, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    transition: Zoom,
    ...overrides,
  });
};
