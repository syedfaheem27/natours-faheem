/* eslint-disable */
import axios from "axios";

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
      alert("Logged in sucessfully");
      setTimeout(() => {
        location.replace("/");
      }, 1500);
    }
  } catch (err) {
    throw err;
  }
};
