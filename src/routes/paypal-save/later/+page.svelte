<script>
    import { onMount } from 'svelte';
    import { loadScript } from '@paypal/paypal-js';
  import Error from '../../+error.svelte';
    let currentTab = 1; // Track the active section/tab
  
    let cardFields;
    let vaultSetupToken;
    let paymentToken;
    let customerId;
    let savedMethods = [];
    let orderId, amount;

    let isLoading = false; // Track loading state
    let successMessage = ''; // Track success message
    let errorMessage = null; // Track error message


     // Function to fetch saved payment methods
  async function fetchSavedPaymentsMethods(customerId) {
    try {
      //const customerId = 'PUxYSWZmvv'; // Replace this with dynamic customer ID if needed
      const response = await fetch(`/paypal-save/later/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customerId }) // Send the customer ID in the request body
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve payment tokens. Status: ${response.status}`);
      }

      const data = await response.json();

      // Map and update savedMethods
      savedMethods = data.paymentTokens.payment_tokens.map(token => ({
        id: token.id,
        type: token.payment_source.card.brand,
        last4: token.payment_source.card.last_digits,
        expiry: token.payment_source.card.expiry,
        deleteLink: token.links.find(link => link.rel === "delete").href,
      }));
    } catch (error) {
      console.error('Error fetching saved payment methods:', error);
    }
  }

// Function to charge the saved payment method 
async function chargeToken(paymentToken) {
    isLoading = true; // Start loading
    orderId = null; // Reset order details
    amount = null;
    errorMessage = null; // Reset error message
    try {
        const response = await fetch('/paypal-save/later/charge-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: paymentToken })
        });

        if (!response.ok) {
            throw new Error(`Failed to charge token. Status: ${response.status}`);
        }

        const data = await response.json();
        orderId = data.orderId?.id;
        amount = data.orderId?.purchase_units[0].payments.captures[0].amount.value;
    } catch (error) {
        console.error('Error charging token:', error);
        errorMessage = `Failed to charge token: ${error.message}`;
    } finally {
        isLoading = false; // End loading
    }
}


    onMount(async () => {
         isLoading = false;
      try {
        // Load PayPal SDK
        const paypal = await loadScript({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: 'USD',
          components: 'card-fields'
        });
  
        if (paypal) {
          cardFields = paypal.CardFields({

            async createVaultSetupToken() {
              isLoading = true; // Start loading state
              successMessage = '';
              // Call your server API to generate a vaultSetupToken and return it
              const result = await fetch("/paypal-save/later", { method: "POST" });
              const data = await result.json();
              console.log(data)
              vaultSetupToken = data.setupTokenResponse.id;
              customerId = data.setupTokenResponse.customer.id;
              return data.setupTokenResponse.id;
            },

            async onApprove(data) {
             // const vaultSetupToken = data.setupTokenResponse.id;

              if (data.liabilityShift) {
                // Handle liability shift (for 3D Secure)
                console.log('Liability Shift:', data.liabilityShift);
              }

              const result = await fetch("/paypal-save/later/payment-token", {
                method: "POST",
                body: JSON.stringify({ vaultSetupToken }), // Pass the vaultSetupToken to the server
            });

              const response = await result.json();
              paymentToken = response.paymentTokenData.id
              isLoading = false;
              successMessage = 'Card successfully saved!';
            },
            onError: (error) => console.error('Something went wrong:', error)
          });
  
          // Render PayPal card fields if eligible
          if (cardFields.isEligible()) {
            cardFields.NameField().render('#card-holder-name');
            cardFields.NumberField().render('#card-number');
            cardFields.ExpiryField().render('#expiration-date');
            cardFields.CVVField().render('#cvv');
          } else {
            console.error('Credit and Debit Cards are not available.');
          }
  
          // Handle form submission
          const submitButton = document.getElementById('submit');
          submitButton.addEventListener('click', () => {
            cardFields.submit()
              .then(() => console.log('Submit was successful'))
              .catch((error) => console.error('Submit error:', error));
          });
        }
      } catch (error) {
        console.error('Error loading PayPal SDK:', error);
      } finally {
        isLoading = false; // End loading state
      }
    });
  
  </script>
  
  <!-- UI Layout with tabs -->
  <div class="min-h-screen bg-gray-100 p-8">
    <!-- Tab navigation -->
    <div class="flex space-x-4 mb-8">
        <button
        class="px-4 py-2 text-lg font-semibold rounded-lg focus:outline-none transition duration-300 {currentTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
        on:click={() => currentTab = 1}>
        Save Card
      </button>
      <button
  class="px-4 py-2 text-lg font-semibold rounded-lg focus:outline-none transition duration-300 {currentTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
  on:click={() => currentTab = 2}>
  Saved Payment Methods
    </button>
    <button
        class="px-4 py-2 text-lg font-semibold rounded-lg focus:outline-none transition duration-300 {currentTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
on:click={() => currentTab = 3}>
Charge Customer
    </button>
    </div>
  
    <!-- Section 1: Save Card Information -->
    {#if currentTab === 1}
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <!-- Checkout form container -->
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Save your Card</h2>
     <!-- Success Message -->
    {#if successMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center mb-6" role="alert">
      <strong class="font-bold">Success! </strong>
      <span class="block sm:inline">{successMessage}</span>
      <svg class="absolute top-1 right-1 h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <p>Payment Token: {paymentToken}</p>
      <p>Customer: {customerId}</p>

    </div>
  {/if}
        <!-- Advanced credit and debit card payments form -->
        <div class="card_container space-y-6">
          <!-- Card number input -->
          <div id="card-number" class="border border-gray-300 p-4 rounded-lg shadow-sm bg-gray-50 focus-within:bg-white transition-colors duration-300"></div>
    
          <!-- Expiration date input -->
          <div id="expiration-date" class="border border-gray-300 p-4 rounded-lg shadow-sm bg-gray-50 focus-within:bg-white transition-colors duration-300"></div>
    
          <!-- CVV input -->
          <div id="cvv" class="border border-gray-300 p-4 rounded-lg shadow-sm bg-gray-50 focus-within:bg-white transition-colors duration-300"></div>
    
          <!-- Cardholder name input -->
          <div id="card-holder-name" class="border border-gray-300 p-4 rounded-lg shadow-sm bg-gray-50 focus-within:bg-white transition-colors duration-300"></div>
    
          <!-- Vault checkbox for saving payment method -->
          <label class="flex items-center space-x-3">
            <input type="checkbox" id="vault" name="vault" class="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out">
            <span class="text-gray-700">Save payment method for future purchases (Vault)</span>
          </label>
          {#if isLoading}
            <!-- Loading Spinner or Loading Text -->
        <div class="w-full text-center text-blue-500 font-semibold mt-4">
          <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p class="mt-2">Saving your card...</p>
        </div>
        {:else}
          <!-- Pay button -->
          <button id="submit" class="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg mt-4 transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300">
            Save Card
          </button>
          {/if}
        </div>
      </div>
    </div>
    {/if}
  
<!-- Section 2: View Saved Payment Methods -->
{#if currentTab === 2}
  <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
    <h2 class="text-2xl font-bold text-center mb-6">Saved Payment Methods</h2>

    <!-- Input field to enter customer ID -->
    <div class="mb-6">
      <label for="customer-id" class="block text-gray-700 font-semibold mb-2">Enter Customer ID:</label>
      <input
        id="customer-id"
        type="text"
        bind:value={customerId}
        class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your customer ID"
      />
    </div>

    <!-- Button to trigger fetching saved payment methods -->
    <div class="text-center">
      <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        on:click={() => fetchSavedPaymentsMethods(customerId)}
      >
        Fetch Saved Payment Methods
      </button>
    </div>

    <!-- Display saved payment methods if available -->
    {#if savedMethods.length > 0}
      <ul class="space-y-4 mt-6">
        {#each savedMethods as method}
          <li class="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center"> 
            <!-- Card Details -->
            <span class="flex-1">{method.type} ending in {method.last4} (Expires {method.expiry})</span>
            <!-- Remove Button -->
            <button class="text-red-600 font-semibold hover:underline">Remove</button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-center text-gray-500 mt-6">No saved payment methods available.</p>
    {/if}
  </div>
{/if}

  
    <!-- Section 3: Charge Customer -->
{#if currentTab === 3}
  <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
    <h2 class="text-2xl font-bold text-center mb-6">Charge Customer</h2>
    <ul class="space-y-4">
      {#each savedMethods as method}
        <li class="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center">
          <span>{method.type} ending in {method.last4} (Expires {method.expiry})</span>
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            on:click={() => chargeToken(method.id)}>
            Charge
          </button>
        </li>
      {/each}
    </ul>

    <!-- Loading Spinner -->
    {#if isLoading}
      <div class="mt-6 flex justify-center">
        <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span class="ml-4 text-blue-500 font-semibold">Processing...</span>
      </div>
    {/if}

    <!-- Display Order Details after Success -->
    {#if orderId && amount}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-6 text-center">
        <p class="font-semibold">Charge Successful!</p>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Amount Charged:</strong> ${amount}</p>
      </div>
    {/if}

    <!-- Display Error Message if Charging Fails -->
    {#if errorMessage}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6 text-center">
        <p class="font-semibold">Error</p>
        <p>{errorMessage}</p>
      </div>
    {/if}
  </div>
{/if}
  </div>

            <!-- Footer Section -->
            <footer class="py-4 text-center">
                <a href="/" class="text-blue-600 hover:text-blue-800 font-medium">Back to Home</a>
              </footer>
            
  
  <style>
    /* Add some styles for better UI */
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    /* You can further adjust the spacing and hover effects */
  </style>