/*eslint-disable*/

import '@babel/polyfill';

import { logIn, logOut } from './login';
import { renderMap } from './mapbox';
import { updateUserSettings } from './updateUserSettings';

const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const map_section = document.getElementById('map');
const logOut_btn = document.querySelector('.nav__el--logout');
const btnSavePassword = document.querySelector('.btn--save-password');

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
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    await updateUserSettings('data', { name, email });
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
