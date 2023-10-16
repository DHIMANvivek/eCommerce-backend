document.addEventListener("DOMContentLoaded", function () {
  const stripe = Stripe("pk_test_51NvsyeSENcdZfgNieuHEl3MFbLSKEWnVlqKxF97VfxgFauyX1117u8BAOdhugASEedbJFeHGVVNtFdyntdXhjmQc001OSOxQvs");
  let elements;

  initialize();
  checkStatus();
  
  document
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);

  var emailAddress = '';
  async function initialize() {
    const response = await fetch("http://localhost:1000/user/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: JSON.parse(localStorage.getItem('paymentIntent')) }),
    });

    //   const inr = JSON.stringify({ items: JSON.parse(localStorage.getItem('paymentIntent')) });
    // const inrObject = JSON.parse(inr);
    // const price = inrObject.items[0].price;

    // console.log(price, "price"); 

    const { clientSecret } = await response.json();
    console.log("Client Secret:", clientSecret);

    const appearance = {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '3px',
        borderRadius: '4px',
      },
      //  labels: 'floating',
    };
    // const elements = stripe.elements();
    elements = stripe.elements({ clientSecret, appearance });
    // const paymentRequest = stripe.paymentRequest({
    //   country: 'IN',
    //   currency: 'inr',
    //   total: {
    //     label: 'Demo total',
    //     amount: 123,
    //   },
    //   requestPayerName: true,
    //   requestPayerEmail: true,
    // });

    // const prButton = elements.create('paymentRequestButton', {
    //   paymentRequest,
    // });

    // (async () => {
    //   console.log("Before calling paymentRequest.canMakePayment()");
    //   const result = await paymentRequest.canMakePayment();
    //   console.log("After calling paymentRequest.canMakePayment()");

    //   if (result) {
    //     prButton.mount('#payment-request-button');
    //   } else {
    //     document.getElementById('payment-request-button').style.display = 'none';
    //     console.error("Error: Payment request cannot be made.");
    //   }
    // })();

    // paymentRequest.on('paymentmethod', async (ev) => {
    //   const {paymentIntent, error: confirmError} = await stripe.confirmCardPayment(
    //     clientSecret,
    //     {payment_method: ev.paymentMethod.id},
    //     {handleActions: false}
    //   );

    //   if (confirmError) {
    //     ev.complete('fail');
    //   } else {
    //     ev.complete('success');
    //     if (paymentIntent.status === "requires_action") {
    //       const {error} = await stripe.confirmCardPayment(clientSecret);
    //       if (error) {

    //       } else {

    //       }
    //     } else {

    //     }
    //   }
    // });
    // elements = stripe.elements({ clientSecret , appearance });

    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

    const shippingAddressElement = elements.create("address", { mode: 'shipping', allowedCountries: ['IN'] });
    shippingAddressElement.mount("#shipping-address-element");

    linkAuthenticationElement.on('change', (event) => {
      emailAddress = event.value.email;
    });

    const paymentElementOptions = {
      layout: "tabs",
    };

    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:4200/cart/billing",
        receipt_email: emailAddress,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }

    setLoading(false);
  }

  async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
      case "succeeded":
        showMessage("Payment succeeded!");
        console.log("Payment succeeded. Payment Intent Status:", paymentIntent);
        break;
      case "processing":
        showMessage("Your payment is processing.");
        console.log("Payment is processing. Payment Intent Status:", paymentIntent.status);
        break;
      case "requires_payment_method":
        showMessage("Your payment was not successful, please try again.");
        console.log("Payment requires a valid payment method. Payment Intent Status:", paymentIntent.status);
        break;
      default:
        showMessage("Something went wrong.");
        console.log("An unexpected error occurred. Payment Intent Status:", paymentIntent.status);
        break;
    }
  }

  function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
      messageContainer.classList.add("hidden");
      messageContainer.textContent = "";
    }, 8000);
  }

  function setLoading(isLoading) {
    if (isLoading) {
      document.querySelector("#submit").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("#submit").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  }
});
