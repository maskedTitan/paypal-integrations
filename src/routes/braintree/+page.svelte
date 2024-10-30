<script>
  import { onMount } from 'svelte';
  let dropinInstance;
  let paymentId = null;
  let deviceData = null;

  const createDropinAndDataCollector = () => {
    braintree.client.create({
      authorization: import.meta.env.VITE_BRAINTREE_TOKENIZATION_KEY
    }, (clientErr, clientInstance) => {
      if (clientErr) {
        console.error('Error creating client:', clientErr);
        return;
      }
        // Create Drop-in UI
        braintree.dropin.create({
          authorization: import.meta.env.VITE_BRAINTREE_TOKENIZATION_KEY,
          container: '#dropin-container',
          dataCollector: true,
          paypal: {
    flow: 'checkout',
    buttonStyle: {
      color: 'gold',
      shape: 'rect',
      size: 'medium'
    }
  },
          card: {
            overrides: {
              fields: {
                number: { placeholder: 'Custom placeholder field to enter the card number' }
              },
              styles: {
                input: { color: 'blue', 'font-size': '12px' }
              }
            }
          }
        }, (dropinErr, instance) => {
          if (dropinErr) {
            console.error('Error creating Drop-in:', dropinErr);
            return;
          }
          dropinInstance = instance;
        });
      });
    };

  const sendTokenToServer = async (tokenId, deviceData) => {
    try {
      const response = await fetch('/braintree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, deviceData }) // Send both token and device data
      });
      const data = await response.json();
      if (data.success) {
        paymentId = data.payment; // Update payment ID reactively
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error sending tokenId:', error);
    }
  };

  const handleSubmit = () => {
    if (!dropinInstance) return;

    dropinInstance.requestPaymentMethod((error, payload) => {
      if (error) {
        console.error('Error requesting payment method:', error);
        return;
      }
      sendTokenToServer(payload.nonce, payload.deviceData);
    });
  };

  onMount(createDropinAndDataCollector);
</script>

  
  <svelte:head>
    <title>Braintree Integration</title>
    <meta name="description" content="Braintree Drop-In UI Checkout Flow" />
  </svelte:head>
  
  <main class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">Braintree Integration</h1>
    </header>

    <section class="space-y-4">
        <p class="text-lg text-gray-700">
          Braintree provides a comprehensive payment gateway with support for various payment methods including credit/debit cards, PayPal, and more. Integrating Braintree into your application allows you to offer a seamless checkout experience and manage transactions efficiently.
        </p>
        <p class="text-lg text-gray-700">
          With Braintree, you can accept payments from multiple sources, including:
        </p>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Credit and debit cards</li>
          <li>PayPal</li>
          <li>Venmo</li>
          <li>Apple Pay and Google Pay</li>
        </ul>
        <p class="text-lg text-gray-700">
          Braintree also offers advanced fraud protection and reporting tools to help you monitor transactions and prevent fraudulent activities.
        </p>
        <p class="text-lg text-gray-700">
          To get started with Braintree integration, refer to the official <a href="https://www.braintreepayments.com/docs" target="_blank" class="text-blue-500 hover:underline">Braintree documentation</a>.
        </p>
      </section>
  
    <section class="space-y-4">
      <p class="text-lg text-gray-700">
        Integrate Braintree's Drop-In UI for a streamlined checkout experience. This UI provides an easy way to accept various payment methods, including credit cards, PayPal, and more.
      </p>
      <p class="text-lg text-gray-700">
        To use Braintree's Drop-In UI, you will need to include the Braintree Drop-In script and configure it with your authorization token. The script initializes the Drop-In UI, allowing users to enter payment information and complete transactions.
      </p>
      <a href="/braintree/ClientTokenWithCustomer" class="text-md text-blue-500 underline hover:underline">Click here for the Client Token with Customer ID transaction flow</a>
      <div id="dropin-container"></div>
      <button
        type="button"
        class="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
        on:click={handleSubmit}
      >
        Purchase
      </button>
      <!-- Display the payment ID -->
      {#if paymentId}
      <div class="mt-4 border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-bold text-gray-700">Payment Details</h3>
        <pre>{JSON.stringify(paymentId, null, 2)}</pre>
      </div>
    {/if}
    </section>
  
    <footer class="mt-8 text-center">
      <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
    </footer>
  </main>  