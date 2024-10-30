<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
    let googlePayButton;
    let paymentResult = null;
    let error = null;
    let paymentDetails = null;
  
    onMount(() => {
      // Load the Google Pay script if not already loaded
      if (!window.google || !window.google.payments || !window.google.payments.api) {
        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.async = true;
        document.head.appendChild(script);
    
        script.onload = () => {
          initializeGooglePay();
        };
      } else {
        initializeGooglePay();
      }
    });
  
    async function initializeGooglePay() {
      try {
        const braintreeClient = await createBraintreeClient();
        const googlePaymentInstance = await createGooglePaymentInstance(braintreeClient);
        const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });
        
        googlePayButton.addEventListener('click', async (event) => {
          event.preventDefault();
          
          try {
            const paymentDataRequest = googlePaymentInstance.createPaymentDataRequest({
              transactionInfo: {
                currencyCode: 'USD',
                totalPriceStatus: 'FINAL',
                totalPrice: '100.00'
              }
            });
            
            const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
            const result = await googlePaymentInstance.parseResponse(paymentData);
            
            paymentResult = result; // Update the result
            console.log(result)
            sendNonceToServer(result.nonce);
          } catch (err) {
            error = err.message; // Update the error
          }
        });
      } catch (err) {
        error = err.message; // Update the error
      }
    }
  
    async function createBraintreeClient() {
      return new Promise((resolve, reject) => {
        braintree.client.create({
          authorization: 'sandbox_ykmkmp4n_b6bnqwx858gzdsdc'
        }, (err, clientInstance) => {
          if (err) {
            reject(err);
          } else {
            resolve(clientInstance);
          }
        });
      });
    }
  
    async function createGooglePaymentInstance(clientInstance) {
      return new Promise((resolve, reject) => {
        braintree.googlePayment.create({
          client: clientInstance,
          googlePayVersion: 2,
          googleMerchantId: 'your-merchant-id-from-google'
        }, (err, googlePaymentInstance) => {
          if (err) {
            reject(err);
          } else {
            resolve(googlePaymentInstance);
          }
        });
      });
    }

    async function sendNonceToServer(nonce) {
        try {
            const response = await fetch('/google-pay', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({nonce})
            });
            const data = await response.json();
            console.log(data);
            paymentDetails = data;
        } catch(error) {
            console.error(error)
        }
    }
  </script>
  
<!-- Google Pay Checkout Section -->
<div class="flex flex-col md:flex-row items-center justify-center h-screen bg-gray-100 p-6">
    <!-- Checkout Section -->
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full md:w-1/2">
        <h2 class="text-2xl font-bold mb-4 text-center">Quick & Secure Checkout</h2>
        <p class="text-lg text-gray-600 mb-4 text-center">Use Google Pay to complete your purchase effortlessly. Fast and secure with just a few taps!</p>
        <div class="flex items-center justify-center mb-4">
            <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="Google Pay Logo" class="w-24" />
        </div>
        <div class="flex justify-center">
            <button bind:this={googlePayButton} class="py-3 px-6 rounded-lg bg-black text-white flex items-center justify-center text-lg font-semibold transition duration-300 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
                <span>Pay with Google Pay</span>
            </button>
        </div>
        <footer class="mt-8 text-center">
          <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
        </footer>
    </div>

    <!-- Result Section -->
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full md:w-1/2 mt-6 md:mt-0 md:ml-6">
        {#if paymentDetails}
            <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">Payment Details</h3>
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <p class="text-lg font-semibold text-green-800 text-center">Transaction Completed!</p>
                <div class="mt-2">
                    <p class="text-gray-700"><strong>Amount:</strong> ${paymentDetails.paymentId.transaction.amount}</p>
                    <p class="text-gray-700"><strong>Transaction ID:</strong> {paymentDetails.paymentId.transaction.id}</p>
                </div>
            </div>
        {/if}
        {#if error}
            <h3 class="text-xl font-bold mb-2 text-center text-red-600">Error</h3>
            <p class="text-lg text-red-600 text-center">{error}</p>
        {/if}
    </div>
</div>

  
  