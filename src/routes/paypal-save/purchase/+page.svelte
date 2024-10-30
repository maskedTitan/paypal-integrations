<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { loadScript } from '@paypal/paypal-js';
  
    let paypal;
    let orderId;
    let idToken;
    let isLoading = true; // State to track loading

  
    onMount(async () => {
      try {
        // Fetch the order data and id_token from the server
        const response = await fetch('/paypal-save/purchase', {
          method: 'POST'
        });
  
        const { orderData, id_token } = await response.json();
  
        // Set the orderId and idToken from the server response
        orderId = orderData.id;
        idToken = id_token;
  
        // Load the PayPal SDK
        paypal = await loadScript({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          dataUserIdToken: idToken, // Use the idToken from the response,
          enableFunding: 'venmo'
        });
  
        if (paypal) {
          // Render the PayPal buttons
          paypal.Buttons({
            style: {
                shape: 'sharp',
                layout: 'vertical',
                color: 'gold',
                label: 'paypal',
                height: 40, // Adjust the button height
              },
            // Call your server to set up the transaction using the orderId
            createOrder: (data, actions) => {
              return orderId; // Return the order ID received from the server
            },
            // Capture the transaction on approval
            onApprove: async (data, actions) => {
                    try {
                        const response = await fetch(`/paypal-checkout/capture`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: orderId }) // Use the stored orderID
                    });

                    const orderData = await response.json();
                    const { id } = orderData.captureData;
                    console.log(
                        "Capture result",
                        orderData,
                        JSON.stringify(orderData, null, 2)
                    );

                    goto(`/paypal-checkout/${id}`)
                   
                    } catch (error) {
                    console.error('Failed to capture order', error);
                    }
                },
            onCancel: function(data, actions) {
              console.log(`Order Canceled - ID: ${data.orderID}`);
            },
            onError: function(err) {
              console.error('Error with PayPal button:', err);
            }
          }).render('#paypal-button-container');
          isLoading = false;  // Hide loading spinner once PayPal is ready

        }
      } catch (error) {
        console.error('Failed to load PayPal SDK or fetch data:', error);
      }
    });
  </script>
  
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
      <div class="flex items-center justify-between">
        <!-- Product Info -->
        <div class="w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1606139377386-9868dee066d0?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZWNvJTIwd2F0ZXIlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D" 
            alt="Reusable Water Bottle" 
            class="w-full h-auto rounded-lg shadow-md" 
          />
        </div>
        <div class="ml-6 w-1/2">
          <h2 class="text-xl font-bold text-gray-800">Eco-Friendly Water Bottle</h2>
          <p class="mt-2 text-gray-600">Stay hydrated and reduce plastic waste with this reusable, eco-friendly water bottle. Perfect for your daily adventures!</p>
          <p class="mt-4 text-gray-900 font-semibold text-lg">$24.99</p>
        </div>
      </div>
  
      <!-- Fast Checkout Section -->
      <div class="mt-6 text-center">
        <p class="text-gray-700 text-lg">
          Use your saved payment method for a <span class="font-bold">fast & secure checkout</span>.
        </p>
        <p class="mt-1 text-gray-500">
          No need to enter payment details. Just one click away from completing your purchase!
        </p>

        <!-- Loading Spinner -->
        {#if isLoading}
          <div class="flex justify-center mt-6">
            <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          </div>
        {/if}
        
        <!-- PayPal Button -->
        <div id="paypal-button-container" class="w-full max-w-xs mx-auto mt-6"></div>
      </div>
  
      <!-- Secure Payment Badge -->
      <div class="mt-6 text-center">
        <p class="text-gray-500 text-sm">🔒 Secure Checkout via PayPal</p>
      </div>

          <!-- Footer Section -->
  <footer class="py-4 text-center">
    <a href="/" class="text-blue-600 hover:text-blue-800 font-medium">Back to Home</a>
  </footer>

    </div>

  </div>
  
  <style>
    .loader {
      border-color: #f3f3f3;
      border-top-color: #3498db;
      animation: spinner 1.5s linear infinite;
    }
  
    @keyframes spinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>