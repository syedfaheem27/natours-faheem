/*eslint-disable*/

import { hideAlert, showAlert } from "./alert";
import { login } from "./login";
import { logout } from "./logout";
import { loadMap } from "./mapbox";
import { signUp } from "./signup";

const loginBtn = document.getElementById("login");
const signUpBtn = document.getElementById("sign-up");
const logoutBtn = document.getElementById("logout");

const loginForm = document.querySelector(".login-form");
const signUpForm = document.querySelector(".signup-form");

const mapContainer = document.getElementById("map");

if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  loadMap(locations);
}

// LOGIN
if (loginBtn)
  loginBtn.addEventListener("click", () => {
    location.assign("/login");
  });

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
      showAlert("error", err.response.data.message);
      setTimeout(() => {
        hideAlert();
      }, 1500);
    }
  });
}

// SIGN UP
if (signUpBtn)
  signUpBtn.addEventListener("click", () => {
    location.assign("/signup");
  });

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
      console.log(err);
      //   err.response.data.message;
      showAlert("error", err.response.data.message);
      setTimeout(() => {
        hideAlert();
      }, 1500);
    }
  });
}

//LOGOUT
if (logoutBtn) logoutBtn.addEventListener("click", logout);
