/*eslint-disable*/

import '@babel/polyfill';

import { logIn, logOut } from './login';
import { renderMap } from './mapbox';

const form = document.querySelector('.form--login');
const map_section = document.getElementById('map');
const logOut_btn = document.querySelector('.nav__el--logout');

if (map_section) {
  const locations = JSON.parse(map_section.dataset.locations);
  renderMap(locations);
}

if (form)
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    logIn(email, password);
  });

if (logOut_btn) logOut_btn.addEventListener('click', logOut);
