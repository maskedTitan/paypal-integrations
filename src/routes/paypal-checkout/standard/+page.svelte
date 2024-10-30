<script>
    import { onMount } from 'svelte';
    import { loadScript } from '@paypal/paypal-js';
    import { goto } from '$app/navigation';
  
    let paypal;
    let currentOrderId = '';
  
    onMount(async () => {
      try {
        paypal = await loadScript({ clientId: 'AQD1grlR1Aiy7WMw6eo8VGEkQT_FW0dj3QEni0Vcgk7ybUYvAd6iuC14Fw6TKnXyyGG1d_LcQ3rZhZTi', enableFunding: 'venmo'});
  
        if (paypal) {
          try {
            paypal.Buttons({
              style: {
                shape: 'sharp',
                layout: 'vertical',
                color: 'gold',
                label: 'paypal',
                height: 40, // Adjust the button height
              },
              createOrder: async () => {
                try {
                  const response = await fetch('/paypal-checkout/standard', {
                    method: 'POST'
                  });
  
                  const data = await response.json();
                  if (data.orderData.id) {
                    currentOrderId = data.orderData.id;
                    return data.orderData.id;
                  }
                  //To-Do study the error response
                  const errorDetail = orderData?.details?.[0];
                  const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);
  
                  throw new Error(errorMessage);
                } catch (error) {
                  console.error('Failed to create order', error);
                }
              },
              onApprove: async (data, actions) => {
                    try {
                        const response = await fetch(`/paypal-checkout/capture`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: currentOrderId }) // Use the stored orderID
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
                }
            }).render('#paypal-button-container');
          } catch (error) {
            console.error('Failed to render PayPal Buttons', error);
          }
        }
      } catch (error) {
        console.error('Failed to load PayPal JS SDK script', error);
      }
    });
  </script>
  
  <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg mt-12">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Secure Checkout</h1>
    <p class="text-gray-600 mb-6">
      Please review your details and proceed with payment. Your payment information is securely processed by PayPal.
    </p>
    
    <!-- PayPal Buttons Container -->
    <div id="paypal-button-container" class="my-6"></div>
  
    <!-- Additional Content (if needed) -->
    <footer class="mt-8 text-center">
      <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
    </footer>
  </div>
  