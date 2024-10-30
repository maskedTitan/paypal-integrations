<script>
   import {
       onMount
   } from 'svelte';

   let CLIENT_AUTHORIZATION = 'sandbox_ykmkmp4n_b6bnqwx858gzdsdc';
   let nonce = '';
   let paymentId = null;
   let showFullPayload = false;
   let loading = false;

   const toggleDetails = () => {
       showFullPayload = !showFullPayload;
   };

   // Reactive statement to update the URL when paymentId changes
   $: redirectToChargeUrl = paymentId?.paypal?.token ? `/token-management?token=${paymentId.paypal.token}` : '';

   const sendTokenToServer = async (tokenId) => {
       loading = true;
       try {
           const response = await fetch('/paypal/vault', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   tokenId
               })
           });

           const data = await response.json();
           console.log('server response ', data);
           if (data) {
               paymentId = await data.response.transaction; // Update the payment ID reactively
           } else {
               console.error('Error:', data.error);
           }
       } catch (error) {
           console.error('error sending tokenId', error)
       } finally {
           loading = false;
       }
   }

   onMount(() => {

       braintree.client.create({
           authorization: CLIENT_AUTHORIZATION
       }, function(clientErr, clientInstance) {
           if (clientErr) {
               console.error('Error creating client:', clientErr);
               return;
           }

           braintree.paypalCheckout.create({
               client: clientInstance
           }, function(paypalCheckoutErr, paypalCheckoutInstance) {
               if (paypalCheckoutErr) {
                   console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
                   return;
               }

               paypalCheckoutInstance.loadPayPalSDK({
                   vault: true,
               }, function() {
                   paypal.Buttons({
                       fundingSource: paypal.FUNDING.PAYPAL,

                       createBillingAgreement: function() {
                           return paypalCheckoutInstance.createPayment({
                               flow: 'vault',
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

                       onApprove: async function(data, actions) {
                           return paypalCheckoutInstance.tokenizePayment(data, function(err, payload) {
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

                       onCancel: function(data) {
                           console.log('PayPal payment cancelled', JSON.stringify(data, null, 2));
                       },

                       onError: function(err) {
                           console.error('PayPal error', err);
                       }
                   }).render('#paypal-button').then(function() {
                       console.log('PayPal button rendered');
                   });
               });
           });
       });
   }); 
</script>
  
  <main class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">PayPal Vault Integration</h1>
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

    {#if loading}
    <div class="flex flex-col justify-center items-center h-48 space-y-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-8 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        <div class="absolute inset-0 border-8 border-blue-600 border-t-transparent border-solid rounded-full opacity-50 animate-spin" style="animation-delay: -0.5s;"></div>
      </div>
      <div class="text-blue-600 text-lg font-semibold">Loading transaction details...</div>
    </div>
    {/if}
  
    {#if paymentId}
    <div class="mt-4 border border-gray-300 rounded-lg p-6 shadow-sm bg-white">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">ID:</span>
          <span class="text-gray-800">{paymentId.id}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">Status:</span>
          <span class="text-gray-800 capitalize">{paymentId.status}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">Type:</span>
          <span class="text-gray-800 capitalize">{paymentId.type}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">Amount:</span>
          <span class="text-gray-800">{paymentId.amount} {paymentId.currencyIsoCode}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">Merchant Account ID:</span>
          <span class="text-gray-800">{paymentId.merchantAccountId}</span>
        </div>
        {#if paymentId.paypal}
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Token:</span>
            <a
              href={redirectToChargeUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              {paymentId.paypal.token}
            </a>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Payer Email:</span>
            <span class="text-gray-800">{paymentId.paypal.payerEmail}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Debug ID:</span>
            <span class="text-gray-800">{paymentId.paypal.debugId}</span>
          </div>
        {/if}
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">Created At:</span>
          <span class="text-gray-800">{new Date(paymentId.createdAt).toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium text-gray-600">Updated At:</span>
          <span class="text-gray-800">{new Date(paymentId.updatedAt).toLocaleString()}</span>
        </div>
      </div>
      {#if showFullPayload}
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-600">Full Payment ID Object</h4>
          <pre class="bg-gray-100 p-2 rounded">{JSON.stringify(paymentId, null, 2)}</pre>
        </div>
      {/if}
      <button on:click={toggleDetails} class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        {showFullPayload ? 'Hide Full Details' : 'Show Full Details'}
      </button>
    </div>
  {/if}
    
    <footer class="mt-8 text-center">
      <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
    </footer>
  </main>
  
  