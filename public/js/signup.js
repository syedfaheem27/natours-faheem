/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

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

    console.log(res);
    console.log(res.data.status);
    if (res.data.status === "success") {
      showAlert(
        "success",
        "Signed up successfully. Login to get enhanced benefits.",
      );
      setTimeout(() => {
        location.replace("/login");
      }, 1500);
    }
  } catch (err) {
    throw err;
  }
};
