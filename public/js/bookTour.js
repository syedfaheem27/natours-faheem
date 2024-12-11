/*eslint-disable*/
import axios from "axios";

export const bookTour = async tourId => {
  try {
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    if (res.data.status === "success") {
      location.replace(res.data.data.session.url);
    }
  } catch (err) {
    console.log(err);
  }
};
