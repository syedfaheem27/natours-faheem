/*eslint-disable*/

import { previewImage } from "./imagePreview";
import { login } from "./login";
import { logout } from "./logout";
import { loadMap } from "./mapbox";
import { signUp } from "./signup";
import { updateData } from "./updateUserDetails";

const loginBtn = document.getElementById("login");
const signUpBtn = document.getElementById("sign-up");
const logoutBtn = document.getElementById("logout");

const loginForm = document.querySelector(".form--login");
const signUpForm = document.querySelector(".form--signup");
const updateUserForm = document.querySelector(".form-user-data");
const updateUserPasswordForm = document.querySelector(".form-user-password");

const photoInput = document.getElementById("photo");

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
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("photo", document.getElementById("photo").files[0]);

    // const name = formData.get("name");
    // const email = formData.get("email");

    updateData(formData, "updateMe");
  });

if (updateUserPasswordForm)
  updateUserPasswordForm.addEventListener("submit", async e => {
    e.preventDefault();
    const saveBtn = document.querySelector(".btn-save-password");
    saveBtn.textContent = "Updating password...";
    const formData = new FormData(e.target);
    const currPassword = formData.get("password-current");
    const password = formData.get("password");
    const passwordConfirm = formData.get("password-confirm");

    const currPass = document.getElementById("password-current");
    const pass = document.getElementById("password");
    const passConf = document.getElementById("password-confirm");

    const data = {
      prevPassword: currPassword,
      password,
      passwordConfirm,
    };
    await updateData(data, "updatePassword");
    saveBtn.textContent = "Save password";
    currPass.value = "";
    pass.value = "";
    passConf.value = "";
  });

//PREVIEW IMAGE
if (photoInput)
  photoInput.addEventListener("change", () => {
    previewImage(photoInput, ".form__user-photo");
  });
