/* eslint-disable */
import axios from "axios";

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
    if (res.data.status === "success") {
      alert("Signed up sucessfully");
      setTimeout(() => {
        location.replace("/login");
      }, 1500);
    }
  } catch (err) {
    throw err;
  }
};
