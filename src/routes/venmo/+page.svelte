<script>
  import { onMount, onDestroy } from 'svelte';

  let venmoInstance;
  let dataCollectorInstance;
  let venmoButtonVisible = true;
  let venmoButtonDisabled = false;
  let paymentDetailsVisible = false;
  let paymentDetails = null;

  const CLIENT_AUTHORIZATION = import.meta.env.VITE_BRAINTREE_TOKENIZATION_KEY;

  onMount(async () => {
    try {
      const { default: client } = await import('braintree-web/client');
      const { default: venmo } = await import('braintree-web/venmo');
      const { default: dataCollector } = await import('braintree-web/data-collector');

      const clientInstance = await createBraintreeClient(client);
      await initializeVenmo(venmo, clientInstance);
      await initializeDataCollector(dataCollector, clientInstance);
      handleExistingTokenizationResult();
    } catch (err) {
      handleError(err);
    }
  });

  onDestroy(() => {
    venmoInstance = null;
    dataCollectorInstance = null;
  });

  async function handleVenmoButtonClick() {
    venmoButtonDisabled = true;

    if (venmoInstance) {
      try {
        const payload = await new Promise((resolve, reject) => {
          venmoInstance.tokenize((err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        const nonce = payload.nonce;
        const deviceData = dataCollectorInstance ? dataCollectorInstance.deviceData : null;

        const responseData = await sendToBackend(nonce, deviceData);

        paymentDetails = responseData;
        console.log(paymentDetails);
        paymentDetailsVisible = true;
        venmoButtonVisible = false;
        
      } catch (err) {
        handleError(err);
      } finally {
        venmoButtonDisabled = false;
      }
    }
  }

  async function sendToBackend(nonce, deviceData) {
    try {
      const response = await fetch('/venmo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nonce, deviceData }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error sending data to backend:', err);
      alert('Failed to process payment. Please try again.');
      throw err;
    }
  }

  function handleError(err) {
    console.error('Venmo Error:', err);
    alert('Something went wrong with Venmo payment.');
  }

  function handleSuccess(payload) {
    console.log('Venmo Success!', payload);
    console.log('Venmo user:', payload.details.username);
  }

  function handleMakeAnotherPayment() {
    paymentDetailsVisible = false;
    venmoButtonVisible = true;
    paymentDetails = null;
  }

  async function createBraintreeClient(client) {
    return new Promise((resolve, reject) => {
      client.create({ authorization: CLIENT_AUTHORIZATION }, (err, clientInstance) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(clientInstance);
      });
    });
  }

  async function initializeVenmo(venmo, clientInstance) {
    return new Promise((resolve, reject) => {
      venmo.create({
        client: clientInstance,
        allowDesktop: true,
        allowDesktopWebLogin: true,
        paymentMethodUsage: 'multi_use',
        mobileWebFallBack: true
      }, (err, venmoInstanceCreated) => {
        if (err) {
          reject(err);
          return;
        }
        if (!venmoInstanceCreated.isBrowserSupported()) {
          console.log('Browser does not support Venmo');
          return;
        }
        venmoInstance = venmoInstanceCreated;
        displayVenmoButton();
        resolve(venmoInstance);
      });
    });
  }

  async function initializeDataCollector(dataCollector, clientInstance) {
    return new Promise((resolve, reject) => {
      dataCollector.create({
        client: clientInstance,
        paypal: true
      }, (err, dataCollectorInstanceCreated) => {
        if (err) {
          reject(err);
          return;
        }
        dataCollectorInstance = dataCollectorInstanceCreated;
        resolve(dataCollectorInstance);
      });
    });
  }

  function handleExistingTokenizationResult() {
    if (venmoInstance && venmoInstance.hasTokenizationResult()) {
      venmoInstance.tokenize((err, payload) => {
        if (err) handleError(err);
        else handleSuccess(payload);
      });
    }
  }

  function displayVenmoButton() {
    venmoButtonVisible = true;
  }
</script>

<div class="min-h-screen flex flex-col justify-between bg-gradient-to-br from-gray-100 to-blue-100">
  <!-- Main Content -->
  <div class="flex flex-col justify-center items-center flex-grow">
    <div class={`max-w-md w-full bg-white p-8 rounded-lg shadow-2xl text-center transform transition-opacity duration-300 ${paymentDetailsVisible ? 'opacity-0' : 'opacity-100'}`}>
      <h2 class="text-3xl font-bold text-blue-600 mb-6">Venmo Payment</h2>
      <p class="text-gray-700 mb-8 leading-relaxed">
        Securely process your payment using Venmo. Click the button below to proceed with your transaction.
      </p>

      {#if venmoButtonVisible}
        <button
          on:click={handleVenmoButtonClick}
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={venmoButtonDisabled}>
          {venmoButtonDisabled ? 'Processing...' : 'Pay with Venmo'}
        </button>
      {/if}
    </div>

    {#if paymentDetailsVisible && paymentDetails}
  <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center transition-opacity duration-300">
    <!-- Venmo Themed Header -->
    <div class="bg-blue-600 text-white p-4 rounded-t-lg">
      <h2 class="text-2xl font-bold">Payment Details</h2>
    </div>
    
    <!-- Payment Information -->
    <div class="p-6">

      <p class="text-lg font-semibold text-gray-900 mb-4">Transaction ID</p>
      <p class="text-gray-700 mb-6 break-words">{paymentDetails.response.transaction.id}</p>

      <p class="text-lg font-semibold text-gray-900 mb-4">Amount</p>
      <p class="text-gray-700 mb-6">${paymentDetails.response.transaction.amount}</p>

      <p class="text-lg font-semibold text-gray-900 mb-4">Status</p>
      <p class="text-gray-700 mb-6 capitalize">{paymentDetails.response.transaction.status}</p>

      <p class="text-lg font-semibold text-gray-900 mb-4">Venmo ID</p>
      <p class="text-gray-700 mb-6">@{paymentDetails.response.transaction.venmoAccount.username}</p>

      <!-- Button to make another payment -->
      <button
        on:click={handleMakeAnotherPayment}
        class="w-full bg-blue-600 text-white font-semibold py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
        Make Another Payment
      </button>
    </div>
  </div>
{/if}
  </div>

  <!-- Footer -->
  <footer class="w-full p-4 bg-white bg-opacity-90 shadow-lg rounded-t-lg text-center transform transition-transform duration-500 hover:translate-y-1">
    <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
  </footer>
</div>
