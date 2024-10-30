<script>
  import { onMount } from 'svelte';

  export let CLIENT_AUTHORIZATION;
  export let route;
  let paymentId = null;

  const sendTokenToServer = async(tokenId, devideData) => {
		try {
			const response = await fetch(`/${route}`, {
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
          console.log(paymentId)
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

<main class="p-3 max-w-4xl mx-auto bg-white">
  
  <section class="space-y-4">
    <div class="flex flex-col items-center my-1 space-y-4">
      <div id="paypal-button" class="w-full max-w-xs"></div>
    </div>
  </section>

  {#if paymentId}
  <div class="bg-white shadow-md rounded-lg p-6 my-4">
    <p class="text-lg font-semibold text-gray-700 mb-2">
      Payment ID: <span class="text-blue-600">{paymentId.transaction.id}</span>
    </p>
    <p class="text-lg font-semibold text-gray-700 mb-2">
      Amount: <span class="text-green-600">${paymentId.transaction.amount}</span>
    </p>
    <p class="text-lg font-semibold text-gray-700">
      Status: <span class={`{paymentId.transaction.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
        {paymentId.transaction.status}
      </span>
    </p>
  </div>
{/if}
</main>
