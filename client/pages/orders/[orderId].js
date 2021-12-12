import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
    const [ timeLeft, setTimeLeft ] = useState(0);
    const { performRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
        },
        onSuccess: (payment) => {
          Router.push('/orders')
        }
    });

    useEffect(() => {
      const findTimeLeft = () => {
        const millisecondsRemaining = new Date(order.expiresAt) - new Date();
        setTimeLeft(Math.round(millisecondsRemaining / 1000))
      }

      findTimeLeft(); //Calling it once so we don't have to wait 1 second for the time to display.
      const timerId = setInterval(findTimeLeft, 1000);

      //If we add a return function is going to be called when the component is no longer shown or we navigate away.
      return () => {
          clearInterval(timerId);
      };
    }, []); //The empty array forces this to be executed once on load.

    if (timeLeft < 0){
        return <div>This order has expired</div>
    } else {
        return (
          <div>
            Time left to pay for this order: {timeLeft} seconds
            <StripeCheckout
              token = {({ id }) => {
                  performRequest({ token: id });
              }}
              stripeKey = "pk_test_51JiksEEwpfkfA6Fdy61cTn2XJ4qcxjqRKrP22c4EtUQFmDFTpGtGW7gHucwHFjVO5msAjaCbMNOOT1Ww0hoaawAF00qP9OZjXw"
              amount = {order.ticket.price * 100}
              email = {currentUser.email}
            />
            {errors}
          </div>
        );
    }    
}

OrderShow.getInitialProps = async (context, client, currentUser) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
}

export default OrderShow;