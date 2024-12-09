/*eslint-disable*/

import { hideAlert, showAlert } from "./alert";
import { login } from "./login";
import { logout } from "./logout";
import { loadMap } from "./mapbox";
import { signUp } from "./signup";
import { updateCurrUser } from "./updateUserDetails";

const loginBtn = document.getElementById("login");
const signUpBtn = document.getElementById("sign-up");
const logoutBtn = document.getElementById("logout");

const loginForm = document.querySelector(".form--login");
const signUpForm = document.querySelector(".form--signup");
const updateUserForm = document.querySelector(".form-user-data");

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
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    login(email, password);
  });
}

// SIGN UP
if (signUpBtn)
  signUpBtn.addEventListener("click", () => {
    location.assign("/signup");
  });

if (signUpForm) {
  signUpForm.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const confrimPassword = formData.get("password-confirm");
    const name = formData.get("name");

    signUp(name, email, password, confrimPassword);
  });
}

//LOGOUT
if (logoutBtn) logoutBtn.addEventListener("click", logout);

//UPDATE USER DETAILS
if (updateUserForm)
  updateUserForm.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");

    updateCurrUser(name, email);
  });
