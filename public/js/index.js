/*eslint-disable*/

import '@babel/polyfill';

import { logIn } from './login';
import { renderMap } from './mapbox';

const form = document.querySelector('.form');
const map_section = document.getElementById('map');

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
