<script>
  import { onMount } from 'svelte';

  let CLIENT_AUTHORIZATION = 'sandbox_ykmkmp4n_b6bnqwx858gzdsdc';
  let paymentId = null;

  const sendTokenToServer = async(tokenId, devideData) => {
		try {
			const response = await fetch('/paypal', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tokenId, devideData })
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

      // Create data collector
      braintree.dataCollector.create({
        client: clientInstance,
        paypal: true // Enable PayPal fraud data collection
      }, function (dataCollectorErr, dataCollectorInstance) {
        if (dataCollectorErr) {
          console.error('Error creating data collector:', dataCollectorErr);
          return;
        }

        // Device data is collected here
        const deviceData = dataCollectorInstance.deviceData;
        console.log(deviceData);

        braintree.paypalCheckout.create({
          client: clientInstance
        }, function (paypalCheckoutErr, paypalCheckoutInstance) {
          if (paypalCheckoutErr) {
            console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
            return;
          }

          paypalCheckoutInstance.loadPayPalSDK({
            currency: 'USD',
            intent: 'capture'
          }, function () {
            paypal.Buttons({
              fundingSource: paypal.FUNDING.PAYPAL,

              createOrder: function () {
                return paypalCheckoutInstance.createPayment({
                  flow: 'checkout',
                  amount: 1,
                  currency: 'USD',
                  intent: 'capture',
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
                  // Submit 'payload.nonce' and device data to your server
                  console.log('Payment tokenized:', payload.nonce);
                  sendTokenToServer(payload.nonce, deviceData);
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
  });
</script>

<main class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
  <header class="text-center mb-8">
    <h1 class="text-3xl font-bold text-blue-600">PayPal Integration</h1>
  </header>

  <section class="space-y-4">
    <p class="text-lg text-gray-700">
      PayPal is a widely-used online payment system that allows users to make payments and money transfers over the internet. Integrating PayPal into your application enables a seamless and secure payment experience for your users.
    </p>
    <p class="text-lg text-gray-700">
      Key features of PayPal integration include:
    </p>
    <ul class="list-disc list-inside space-y-2 text-gray-700">
      <li>Easy payment processing</li>
      <li>Support for PayPal accounts and credit/debit cards</li>
      <li>Fraud prevention tools</li>
      <li>Instant payment notifications</li>
    </ul>
    <p class="text-lg text-gray-700">
      To integrate PayPal, refer to the official <a href="https://developer.paypal.com/docs/api/overview/" target="_blank" class="text-blue-500 hover:underline">PayPal Developer documentation</a>.
    </p>
    <p class="text-lg text-gray-700">
      Explore how to integrate PayPal Vault into your application with this <a href="/paypal/vault" target="_blank" class="text-blue-500 hover:underline">PayPal Vault Integration Demo</a>.
    </p>
  </section>
  
  <section class="space-y-4">
    <div class="flex flex-col items-center my-4 space-y-4">
      <div id="paypal-button" class="w-full max-w-xs"></div>
    </div>
  </section>

  <div class="">
    <p class="text-lg text-gray-700">
      Want to split your payments? Try PayPal's <a href="/paypal/paylater" class="text-blue-500 hover:underline">Pay Later</a> option.
    </p>
  </div>

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
