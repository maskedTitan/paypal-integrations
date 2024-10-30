<script>
    import { onMount } from 'svelte';

    let CLIENT_AUTHORIZATION = 'sandbox_ykmkmp4n_b6bnqwx858gzdsdc';

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
          components: 'buttons,messages',
          currency: 'USD',
          'enable-funding': 'paylater',
          dataAttributes: {
            amount: '10.00'
          }
          // Other config options here
        }, function () {
          const button = paypal.Buttons({
            fundingSource: paypal.FUNDING.PAYLATER,

            createOrder: function () {
              return paypalCheckoutInstance.createPayment({
                flow: 'checkout', 
                amount: '10.00', 
                currency: 'USD'
              });
            },
            onApprove: function (data, actions) {
              return paypalCheckoutInstance.tokenizePayment(data, function (err, payload) {
                if (err) {
                  console.error('Error tokenizing payment:', err);
                  return;
                }
                // Submit 'payload.nonce' to your server
                console.log('Payment tokenized:', payload.nonce);
              });
            }
          });

          if (!button.isEligible()) {
            // Skip rendering if not eligible
            return;
          }

          button.render('#pay-later-button');
        });
      });
    });
    });
</script>

<div class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">PayPal PayLater Option</h1>
    </header>
  
    <section class="space-y-6">
      <div class="text-center">
        <p class="text-lg text-gray-700">
          Take advantage of PayPal's PayLater option, allowing you to purchase now and pay over time. 
        </p>
        <p class="text-lg text-gray-700">
          This flexible payment solution provides the convenience of paying in installments, ensuring that you can manage your finances with ease.
        </p>
      </div>

    <div    class="text-center mx-auto"
            data-pp-message
            data-pp-layout="text"
            data-pp-text-color="black"
            data-pp-logo-type="inline"
            data-pp-amount="1">
    </div>   
  
      <div class="flex flex-col items-center my-6 space-y-6">
        <div id="pay-later-button" class="w-full max-w-xs"></div>
        <p class="text-sm text-gray-600">
          By choosing PayLater, you agree to PayPal's terms and conditions. Your payment will be securely processed through PayPal.
        </p>
      </div>
    </section>
  
    <footer class="mt-8 text-center">
      <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
    </footer>
  </div>