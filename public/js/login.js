/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

export const logIn = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/v1/users/logout',
    });

    console.log(res);
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error Logging out! Try again.');
  }
};
