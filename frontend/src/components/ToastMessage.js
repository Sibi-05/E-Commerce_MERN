import React from "react";
import Alert from "@mui/material/Alert";
import { useDispatch } from "react-redux";
import Snackbar from "@mui/material/Snackbar";
import { closeSnackBar } from "../redux/reducer/snackBarSlice";

const ToastMessage = ({ message, severity, open }) => {
  const dispatch = useDispatch();
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => dispatch(closeSnackBar())}
    >
      <Alert
        onClose={() => dispatch(closeSnackBar())}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
