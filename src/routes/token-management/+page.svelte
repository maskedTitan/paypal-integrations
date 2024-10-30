<script>
  import { fade } from 'svelte/transition'; // Import fade transition
  import { page } from '$app/stores';

  let nonce = $page.url.searchParams.get('token') || '';
  let amount = '';
  let messages = []; // Array to store temporary messages
  let loading = false;
  let error = ''; // State to manage error messages

  async function chargeToken() {
    loading = true; // Show loading indicator
    error = ''; // Clear previous errors
    let newMessage; // Define newMessage outside try block

    try {
      const response = await fetch('/token-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nonce,
          amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to charge token');
      }

      const result = await response.json();
      console.log(result.response);

      if(result.response.transaction) {
        newMessage = {
          id: result.response.transaction.id,
          amount: result.response.transaction.amount,
          status: result.response.transaction.status, // Add status to message
          timestamp: Date.now() // Timestamp for timeout
        };
        messages = [...messages, newMessage];
      } else {
        error = result.response.message;
      }

      // Remove the message after 10 seconds
      setTimeout(() => {
        messages = messages.filter(msg => msg !== newMessage);
      }, 10000);

    } catch (err) {
      console.error(err.message);
      error = err.message; // Set the error message to display
    } finally {
      loading = false; // Hide loading indicator
    }
  }
</script>




  
<!-- Backend UI -->
<div class="min-h-screen bg-gray-100 flex items-center justify-center">
  <div class="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Charge Token</h2>
    <div class="space-y-4">
      
      <div>
        <label for="token" class="block text-sm font-medium text-gray-700">Token Nonce</label>
        <input 
          id="token" 
          type="text" 
          placeholder="9e2fd87d-2650-16e5-7b0b-cce864eda948"
          bind:value={nonce}
          class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
        <input 
          id="amount" 
          type="number" 
          placeholder="Enter amount"
          bind:value={amount}
          class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button 
        on:click={chargeToken} 
        class="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Charge Token
      </button>

      <!-- Loading indicator -->
      {#if loading}
        <div class="flex items-center justify-center mt-4">
          <svg class="w-6 h-6 mr-2 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
            <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" class="opacity-75"/>
          </svg>
          <span>Processing...</span>
        </div>
      {/if}

      <!-- Error message -->
      {#if error}
        <div class="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-sm">
          <p><strong>Error:</strong> {error}</p>
        </div>
      {/if}

      <!-- Display messages -->
      <div class="mt-4 space-y-2">
        {#each messages as message (message.timestamp)}
          <div 
            class={`message-container transition-all duration-500 
              ${message.status === 'authorized' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}
            transition:fade={{ duration: 500 }}>
            <div class="message-content p-4 border rounded-lg shadow-sm">
              <p class="font-semibold">
                {message.status === 'authorized' ? 'Payment Successful' : 'Payment Failed'}
              </p>
              <p><strong>ID:</strong> {message.id}</p>
              <p><strong>Amount:</strong> ${message.amount}</p>
              <p><strong>Status:</strong> {message.status}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .message-container {
    transition: opacity 0.5s, height 0.5s; /* Smooth transition for both opacity and height */
    overflow: hidden; /* Hide content overflow during transition */
  }

  .message-content {
    transition: height 0.5s; /* Ensure the content also transitions smoothly */
  }
</style>


  