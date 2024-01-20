/*eslint-disable*/
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

import { showAlert } from './alerts';

export const loadCheckoutForm = async tourId => {
  try {
    //Get the checkout session from the backend
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    const stripe = await loadStripe(
      'pk_test_51OaNNvSCBQS8hRHebEqqOgEAu1XDJxGaT9AKZNQ0JCdoOFaEatfEf2KBwm5OOopXrWkJIljsufm05C4MJyRUzW1400mq5R0gpf',
    );

    //Redirect to the checkout form and charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
