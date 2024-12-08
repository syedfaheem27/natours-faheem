/*eslint-disable*/

import { login } from "./login";
import { signUp } from "./signup";

const loginBtn = document.getElementById("login");

if (loginBtn)
  loginBtn.addEventListener("click", () => {
    location.assign("/login");
  });

const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const password = formData.get("password");

      await login(email, password);
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
      alert(JSON.stringify(err.response.data));
    }
  });
}

const signUpBtn = document.getElementById("sign-up");

if (signUpBtn)
  signUpBtn.addEventListener("click", () => {
    location.assign("/signup");
  });

const signUpForm = document.querySelector(".signup-form");

if (signUpForm) {
  signUpForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const confrimPassword = formData.get("password-confirm");
    const name = formData.get("name");

    try {
      await signUp(name, email, password, confrimPassword);
    } catch (err) {
      alert(JSON.stringify(err.response.data));
      console.log(err.response.data);
    }
  });
}
