/* eslint-disable */
import axios from "axios";
import { hideAlert, showAlert } from "./alert";

export const signUp = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        email,
        name,
        password,
        passwordConfirm: confirmPassword,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Signed up successfully.");
      setTimeout(() => {
        location.replace("/me");
      }, 1500);
    }
  } catch (err) {
    //   err.response.data.message;
    showAlert("error", err.response.data.message);
    setTimeout(() => {
      hideAlert();
    }, 1500);
  }
};
