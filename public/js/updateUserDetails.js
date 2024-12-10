/*eslint-disable*/
import axios from "axios";
import { hideAlert, showAlert } from "./alert";

const BASE_URL = "/api/v1/users";

export const updateData = async (data, path) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `${BASE_URL}/${path}`,
      data,
    });

    console.log(res);
    if (res.data.status === "success") {
      showAlert("success", "User Data successfully updated.");
      //Previewing the image in the header
      document
        .querySelector(".nav__user-img")
        .setAttribute(
          "src",
          document.querySelector(".form__user-photo").getAttribute("src"),
        );
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", err.response.data.message);
  } finally {
    setTimeout(() => {
      hideAlert();
    }, 1500);
  }
};
