/*eslint-disable*/
import axios from "axios";
import { hideAlert, showAlert } from "./alert";

export const updateCurrUser = async (name, email) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/updateMe",
      data: {
        name,
        email,
      },
    });

    console.log(res);
    if (res.data.status === "success")
      showAlert("success", "User Data successfully updated.");
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", err.response.data.message);
  } finally {
    setTimeout(() => {
      hideAlert();
    }, 1500);
  }
};
