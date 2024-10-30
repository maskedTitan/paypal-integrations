<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';


  let form;
  let submitButton;
  let hostedFieldsInstance;
  let collectedDeviceData;

  const authorization = 'sandbox_ykmkmp4n_b6bnqwx858gzdsdc'; // Replace with your actual Braintree authorization

  // Function to create Braintree client and collect device data
async function createBraintreeClient() {
const { default: client } = await import('braintree-web/client');
const { default: dataCollector } = await import('braintree-web/data-collector');

return new Promise((resolve, reject) => {
  client.create({ authorization }, (err, clientInstance) => {
    if (err) {
      reject(err);
      return;
    }

    // Create Data Collector
    dataCollector.create({
      client: clientInstance,
      // Optionally specify additional options for the data collector
      // such as `kount` for fraud detection
    }, (err, dataCollectorInstance) => {
      if (err) {
        reject(err);
        return;
      }

      // At this point, you should access the dataCollectorInstance.deviceData value
      // You can resolve with both clientInstance and deviceData
      resolve({
        clientInstance,
        deviceData: dataCollectorInstance.deviceData
      });
    });
  });
});
}


  // Function to create Braintree hosted fields
  async function createHostedFields(clientInstance) {
    const { default: hostedFields } = await import('braintree-web/hosted-fields');
    return new Promise((resolve, reject) => {
      hostedFields.create({
        client: clientInstance,
        styles: {
            'input': {
            'font-size': '16px',           // Larger font size for better readability
            'font-family': 'Arial, sans-serif', // Clean and modern font
            'font-weight': '500',          // Medium weight for emphasis
            'padding': '0.75rem',          // Added padding for better spacing
            'border-radius': '0.375rem',   // Rounded corners for a softer look
            'border-width': '2px',         // Thicker border for better visibility
            'border-color': '#e5e7eb',     // Light gray border for a subtle effect
            'box-shadow': '0 1px 3px rgba(0,0,0,0.1)', // Soft shadow for depth
            'transition': 'all 0.3s ease-in-out' // Smooth transition for focus and hover effects
          },
            'input::placeholder': {
            'color': '#9ca3af',            // Lighter gray for placeholder text
            'opacity': '1',                // Ensures placeholder text is fully opaque
            'font-weight': '400'           // Regular weight for placeholder text
          },
            'input.invalid': {
            'color': '#f87171',            // Red text color for invalid input
            'border-color': '#f87171',     // Red border for invalid input
            'box-shadow': '0 1px 3px rgba(248, 113, 113, 0.3)', // Red shadow for invalid input
            'font-weight': '500'           // Medium weight for invalid input
          },
            'input.valid': {
            'color': '#34d399',            // Green text color for valid input
            'border-color': '#34d399',     // Green border for valid input
            'box-shadow': '0 1px 3px rgba(52, 211, 153, 0.3)', // Green shadow for valid input
            'font-weight': '500'           // Medium weight for valid input
          },
            'input:focus': {
            'border-color': '#10b981',     // Bright green border on focus
            'box-shadow': '0 0 0 2px rgba(16, 185, 129, 0.3)', // Green focus ring
            'font-weight': '500'           // Medium weight for focus state
          }
},
        fields: {
          number: { container: '#card-number', placeholder: '4111 1111 1111 1111' },
          cvv: { container: '#cvv', placeholder: '123' },
          expirationDate: { container: '#expiration-date', placeholder: 'MM/YYYY' }
        }
      }, (err, hostedFields) => {
        if (err) reject(err);
        else resolve(hostedFields);
      });
    });
  }

  async function sendTokenToServer(nonce, amount, deviceData) {
    try {
      const response = await fetch('/hosted', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nonce, amount, deviceData})
      });
      const data = await response.json();
      if(data.success){
        goto(`/hosted/${data.payment.transaction.id}`);
      }
    } catch(error) {
      console.error('Error sending to server', error);
    }
  }

  // Function to handle form submission
  function handleSubmit(event) {
    event.preventDefault();

    if (!hostedFieldsInstance) return;

    const amount = form.querySelector('#amount').value;

    hostedFieldsInstance.tokenize((err, payload) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('Got a nonce: ' + payload.nonce);
      // Here you can send the payload.nonce to your server for processing
      sendTokenToServer(payload.nonce, amount, collectedDeviceData);
    });
  }

  // Initialize Braintree components when the component mounts
  onMount(async () => {
    try {
      const {clientInstance, deviceData} = await createBraintreeClient();
      hostedFieldsInstance = await createHostedFields(clientInstance);
      submitButton.removeAttribute('disabled');
      collectedDeviceData = deviceData
      console.log('Device Data:', deviceData);
    } catch (err) {
      console.error('Error initializing Braintree:', err);
    }
  });
</script>

<div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
<h1 class="text-2xl font-bold text-gray-900 mb-4">Secure Hosted Checkout</h1>
<p class="text-gray-600 mb-6">
  Please enter your payment details below to complete your purchase. Your payment information is securely processed by Braintree.
</p>

<form bind:this={form} on:submit={handleSubmit} id="my-sample-form" method="post" class="space-y-6">
  <div>
    <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
    <input id="amount" type="number" min="0" step="0.01" placeholder="Enter amount" class="border-2 border-gray-300 h-12 rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400 w-full" />
  </div>

  <div>
    <label for="card-number" class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
    <div id="card-number" class="border-2 border-gray-300 h-12 rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400"></div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="expiration-date" class="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
      <div id="expiration-date" class="border-2 border-gray-300 h-12 rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400"></div>
    </div>

    <div>
      <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2">CVV</label>
      <div id="cvv" class="border-2 border-gray-300 h-12 rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400"></div>
    </div>
  </div>

  <input bind:this={submitButton} type="submit" value="Pay" disabled class="w-full bg-green-500 text-white px-4 py-3 rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out" />
</form>
<footer class="mt-8 text-center">
  <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
</footer>
</div>



