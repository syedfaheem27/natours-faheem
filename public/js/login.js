/* eslint-disable */
import axios from "axios";
import { showAlert, hideAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    console.log(res.data);
    if (res.data.status === "success") {
      showAlert("success", "Logged In successfully");
      setTimeout(() => {
        location.replace(`/?nocache=${Date.now()}`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    console.log(err.response.data);
    showAlert("error", err.response.data.message);
    setTimeout(() => {
      hideAlert();
    }, 1500);
  }
};
