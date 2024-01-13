/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserSettings = async (type, data) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/updateMe'
        : '/api/v1/users/updateMyPassword';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success')
      showAlert('success', `User ${type.toUpperCase()} updated successfully!`);
  } catch (err) {
    showAlert('error', err.response.data.message);
    return;
  }
};
