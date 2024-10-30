<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    import { tokenStore } from '../../api/store';
    let form;
    let submitButton;
    let hostedFieldsInstance;
    let collectedDeviceData;
  
    let authorization = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5pSXNJbXRwWkNJNklqSXdNVGd3TkRJMk1UWXRjMkZ1WkdKdmVDSXNJbWx6Y3lJNkltaDBkSEJ6T2k4dllYQnBMbk5oYm1SaWIzZ3VZbkpoYVc1MGNtVmxaMkYwWlhkaGVTNWpiMjBpZlEuZXlKbGVIQWlPakUzTWpjNU9ETTROamdzSW1wMGFTSTZJbVpsTVRneU9EZ3dMVFl4WWpVdE5EUXlOeTA0Wldaa0xUa3laalkxTXpoaE5XUmxOU0lzSW5OMVlpSTZJbUkyWW01eGQzZzROVGhuZW1SelpHTWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzV6WVc1a1ltOTRMbUp5WVdsdWRISmxaV2RoZEdWM1lYa3VZMjl0SWl3aWJXVnlZMmhoYm5RaU9uc2ljSFZpYkdsalgybGtJam9pWWpaaWJuRjNlRGcxT0dkNlpITmtZeUlzSW5abGNtbG1lVjlqWVhKa1gySjVYMlJsWm1GMWJIUWlPbVpoYkhObGZTd2ljbWxuYUhSeklqcGJJbTFoYm1GblpWOTJZWFZzZENKZExDSnpZMjl3WlNJNld5SkNjbUZwYm5SeVpXVTZWbUYxYkhRaUxDSkNjbUZwYm5SeVpXVTZRVmhQSWwwc0ltOXdkR2x2Ym5NaU9uc2liV1Z5WTJoaGJuUmZZV05qYjNWdWRGOXBaQ0k2SW1sdVpHbGhYMk4xY25KbGJtTjVYM1JsYzNRaWZYMC5ka0NKcXF6YTNOa3lLQV9VNHJUY0VXamZ4bXRhTUtLTkxNX1ROWHpTU3dlYzNtdG0yY3MyRU5QaWdqZ3AydktKSE9HNnl2Q3R6S0dmRzF5djYxdGtjQSIsImNvbmZpZ1VybCI6Imh0dHBzOi8vYXBpLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb206NDQzL21lcmNoYW50cy9iNmJucXd4ODU4Z3pkc2RjL2NsaWVudF9hcGkvdjEvY29uZmlndXJhdGlvbiIsIm1lcmNoYW50QWNjb3VudElkIjoiaW5kaWFfY3VycmVuY3lfdGVzdCIsImdyYXBoUUwiOnsidXJsIjoiaHR0cHM6Ly9wYXltZW50cy5zYW5kYm94LmJyYWludHJlZS1hcGkuY29tL2dyYXBocWwiLCJkYXRlIjoiMjAxOC0wNS0wOCIsImZlYXR1cmVzIjpbInRva2VuaXplX2NyZWRpdF9jYXJkcyJdfSwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzL2I2Ym5xd3g4NThnemRzZGMvY2xpZW50X2FwaSIsImVudmlyb25tZW50Ijoic2FuZGJveCIsIm1lcmNoYW50SWQiOiJiNmJucXd4ODU4Z3pkc2RjIiwiYXNzZXRzVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhdXRoVXJsIjoiaHR0cHM6Ly9hdXRoLnZlbm1vLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJ2ZW5tbyI6Im9mZiIsImNoYWxsZW5nZXMiOlsiY3Z2Il0sInRocmVlRFNlY3VyZUVuYWJsZWQiOnRydWUsImFuYWx5dGljcyI6eyJ1cmwiOiJodHRwczovL29yaWdpbi1hbmFseXRpY3Mtc2FuZC5zYW5kYm94LmJyYWludHJlZS1hcGkuY29tL2I2Ym5xd3g4NThnemRzZGMifSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImJpbGxpbmdBZ3JlZW1lbnRzRW5hYmxlZCI6dHJ1ZSwiZW52aXJvbm1lbnROb05ldHdvcmsiOmZhbHNlLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYWxsb3dIdHRwIjp0cnVlLCJkaXNwbGF5TmFtZSI6IlBheVBhbCIsImNsaWVudElkIjoiQVFEMWdybFIxQWl5N1dNdzZlbzhWR0VrUVRfRlcwZGozUUVuaTBWY2drN3liVVl2QWQ2aXVDMTRGdzZUS25YeXlHRzFkX0xjUTNyWmhaVGkiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJicmFpbnRyZWVDbGllbnRJZCI6Im1hc3RlcmNsaWVudDMiLCJtZXJjaGFudEFjY291bnRJZCI6InBheXBhbCIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9fQ==";
  
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
        const response = await fetch('/hosted-inr', {
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
    Please enter your payment details below to complete your purchase. Your payment information is securely processed by Braintree. All payments will be made in INR 
    <span class="ml-1 align-middle">
        <img src="https://cdn.countryflags.com/thumbs/india/flag-400.png" alt="India Flag" class="inline h-5 w-5 align-middle"/>
    </span>.
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
  
  
  
  