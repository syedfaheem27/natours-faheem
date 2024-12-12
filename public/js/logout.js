/*eslint-disable*/
// import axios from "axios";
import { showAlert, hideAlert } from "./alert";

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/logout",
    });

    if (res.data.status === "success") {
      showAlert("success", "Successfully logged out");
      setTimeout(() => location.reload(true), 300);
    }
  } catch (err) {
    showAlert("error", "Something went wrong while logging you out.");
    setTimeout(() => {
      hideAlert();
    }, 1500);
  }
};
