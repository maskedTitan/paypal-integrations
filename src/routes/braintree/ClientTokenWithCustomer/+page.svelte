<script>
    import { onMount } from 'svelte';
    let dropinInstance;
    let paymentId = null;

    export let data;
    console.log(data);

    onMount(() => {
		const container = document.getElementById('dropin-container');
		braintree.dropin.create(
			{
				authorization: data.token,
				container: '#dropin-container'
			},
			// @ts-ignore
			(error, instance) => {
				if (error) {
					console.error('Error creating Drop-in:', error);
					return;
				}
				dropinInstance = instance;
			}
		);
	});

    const handleSubmit =  async () => {
		
		if (!dropinInstance) return; // Handle case where Drop-in isn't ready

		dropinInstance.requestPaymentMethod((error, payload) => {
			if (error) {
				console.error('Error requesting payment method:', error);
				return;
			}
			// Send payload.nonce to your server for processing
			console.log(payload);
			const tokenId = payload.nonce;

			 sendTokenToServer(tokenId);

		});

        const sendTokenToServer = async(tokenId) => {
		try {
			const response = await fetch('/braintree', {
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

	};


  </script>
  
  <svelte:head>
    <title>Braintree Integration(Client Token with Customer ID)</title>
    <meta name="description" content="Braintree Drop-In UI Checkout Flow" />
  </svelte:head>
  
  <main class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">Braintree Integration(Client Token with Customer)</h1>
    </header>

    <section class="space-y-4">
        <p class="text-lg text-gray-700">
            The Braintree Drop-in UI, when used with a client token generated with a customer ID, offers a streamlined payment experience for both you and your customers. Here's a breakdown of how it works:        </p>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Client Token: A unique identifier generated on your server that authorizes a client-side interaction with the Braintree gateway.</li>
          <li>A unique identifier for a customer in your system, allowing Braintree to associate payment methods with that customer.</li>
          <li>Drop-in UI: A pre-built UI component provided by Braintree that handles the payment form, tokenization, and other payment-related interactions.</li>
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
        To use Braintree's Drop-In UI, you will need to include the Braintree Drop-In script and configure it with the client token. The script initializes the Drop-In UI, allowing users to enter payment information and complete transactions.
      </p>
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