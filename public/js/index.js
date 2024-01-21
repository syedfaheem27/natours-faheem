/*eslint-disable*/

import '@babel/polyfill';

import { logIn, logOut } from './login';
import { renderMap } from './mapbox';
import { updateUserSettings } from './updateUserSettings';
import { loadCheckoutForm } from './stripe';

const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const map_section = document.getElementById('map');
const logOut_btn = document.querySelector('.nav__el--logout');
const btnSavePassword = document.querySelector('.btn--save-password');
const btnBooking = document.getElementById('book-tour');

if (map_section) {
  const locations = JSON.parse(map_section.dataset.locations);
  renderMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await logIn(email, password);
  });

if (logOut_btn) logOut_btn.addEventListener('click', logOut);

if (userDataForm)
  userDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    if (document.getElementById('photo').files)
      form.append('photo', document.getElementById('photo').files[0]);

    await updateUserSettings('data', form);
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    btnSavePassword.textContent = 'Updating password...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserSettings('password', {
      passwordCurrent,
      password,
      passwordConfirm,
    });

    btnSavePassword.textContent = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

//Showing image preview before uploading

const image_el = document.querySelector('.form__user-photo');
const photo_input = document.getElementById('photo');

if (photo_input) {
  function handleInputChange(e) {
    const imgFile = e.target.files?.[0];

    if (!imgFile?.type.startsWith('image/')) return;
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      image_el.setAttribute('src', reader.result);
    });

    reader.readAsDataURL(imgFile);
  }

  photo_input.addEventListener('change', handleInputChange);
}

//Booking tours
if (btnBooking)
  btnBooking.addEventListener('click', async e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;

    await loadCheckoutForm(tourId);
  });
