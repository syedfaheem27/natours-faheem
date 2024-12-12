/*eslint-disable*/
// import axios from "axios";

export const bookTour = async tourId => {
  try {
    const stripe = await stripe.loadStripe(
      "pk_test_51QUsAqSDx1v8ADvKITuzM7klQ2RdGCUL5EVBWtbd5X0eYuKP53w7FyERfEGIHF4iYp7lkfHQ3alLaQFWKjypAe6u00f3dwHRJo",
    );

    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    const session = res.data.data.session;

    if (res.data.status === "success") {
      // location.replace(session.url);
      await stripe.redirectToCheckout({
        sessionId: session.id,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
