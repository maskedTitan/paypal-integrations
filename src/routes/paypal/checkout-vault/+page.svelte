<script>
    import { onMount } from 'svelte';
  
    let CLIENT_AUTHORIZATION = 'sandbox_ykmkmp4n_b6bnqwx858gzdsdc';
    let nonce = '';
    let paymentId = null;
  
    const sendTokenToServer = async(tokenId) => {
          try {
              const response = await fetch('/paypal', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ tokenId })
              });
  
              const data = await response.json();
              console.log('server response ', data);
              if (data.success) {
                      paymentId = await data.payment; // Update the payment ID reactively
                  } else {
                      console.error('Error:', data.error);
                  }
          } catch (error) {
              console.error('error sending tokenId', error)
          }
      }
  
    onMount(() => {
  
      braintree.client.create({
        authorization: CLIENT_AUTHORIZATION
      }, function (clientErr, clientInstance) {
        if (clientErr) {
          console.error('Error creating client:', clientErr);
          return;
        }
  
        braintree.paypalCheckout.create({
          client: clientInstance
        }, function (paypalCheckoutErr, paypalCheckoutInstance) {
          if (paypalCheckoutErr) {
            console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
            return;
          }
  
          paypalCheckoutInstance.loadPayPalSDK({
            vault: true,
          }, function () {
            paypal.Buttons({
              fundingSource: paypal.FUNDING.PAYPAL,
  
              createBillingAgreement: function () {
                return paypalCheckoutInstance.createPayment({
                  flow: 'checkout',
                  requestBillingAgreement: true,
                  amount: 1,
                  currency: 'USD',
                  enableShippingAddress: true,
                  shippingAddressEditable: false,
                  shippingAddressOverride: {
                    recipientName: 'Harsha Marri',
                    line1: '222W Merchandise Mart Plaza',
                    line2: '9',
                    city: 'Chicago',
                    countryCode: 'US',
                    postalCode: '60652',
                    state: 'IL',
                    phone: '123.456.7890'
                  }
                });
              },
  
              onApprove: async function (data, actions) {
                return paypalCheckoutInstance.tokenizePayment(data, function (err, payload) {
                  if (err) {
                    console.error('Error tokenizing payment:', err);
                    return;
                  }
                  nonce = payload.nonce;
                  console.log(payload);
                  console.log('Payment tokenized:', payload.nonce);
                  sendTokenToServer(payload.nonce);
                });
              },
  
              onCancel: function (data) {
                console.log('PayPal payment cancelled', JSON.stringify(data, null, 2));
              },
  
              onError: function (err) {
                console.error('PayPal error', err);
              }
            }).render('#paypal-button').then(function () {
              console.log('PayPal button rendered');
            });
          });
        });
      });
    });
  </script>
  
  <main class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">PayPal Checkout-Vault Integration</h1>
    </header>
  
    <section class="space-y-4">
      <p class="text-lg text-gray-700">
        The PayPal Vault allows users to securely store their payment information for future transactions. This integration provides a seamless payment experience by allowing users to save their PayPal or credit/debit card details, which can be used later without re-entering the information.
      </p>
  
      <p class="text-lg text-gray-700">
        To proceed with the payment, click the button below:
      </p>
  
      <div class="flex flex-col items-center my-4 space-y-4">
        <div id="paypal-button" class="w-full max-w-xs"></div>
      </div>
    </section>
  
    {#if nonce} 
      <div class="mt-4 border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-bold text-gray-700">Payment Nonce</h3>
        <pre>{nonce}</pre>
      </div>
    {/if}
  
    {#if paymentId}
      <div class="mt-4 border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-bold text-gray-700">Payment Details</h3>
        <pre>{JSON.stringify(paymentId, null, 2)}</pre>
      </div>
    {/if}
    
    <footer class="mt-8 text-center">
      <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
    </footer>
  </main>
  
  