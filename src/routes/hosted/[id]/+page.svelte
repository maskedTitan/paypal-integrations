<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
  
    let transaction = null;
    let error = null;
  
    // Retrieve the transaction ID from the URL
    const id = $page.params.id;
  
    onMount(async () => {
      try {
        // Fetch transaction details from the server
        const response = await fetch(`/hosted/${id}`);
        const data = await response.json();
  
        if (response.ok) {
          transaction = data;
        } else {
          error = data.error || 'Failed to fetch transaction details';
        }
      } catch (err) {
        console.error('Error:', err);
        error = 'Failed to fetch transaction details';
      }
    });
  </script>
  
  {#if error}
  <div class="max-w-4xl mx-auto mt-10 p-8 bg-red-50 border-l-8 border-red-500 rounded-lg shadow-lg">
    <h2 class="text-red-700 text-2xl font-semibold">Oops! Something went wrong</h2>
    <p class="mt-3 text-red-600 text-lg">{error}</p>
  </div>
{:else if transaction}
<div class="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg border border-gray-300">
  <h1 class="text-4xl font-extrabold text-gray-900 mb-8 border-b-4 border-blue-500 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 p-2 rounded-t-lg">
    Transaction Details
  </h1>
  
  <div class="space-y-6">
    <div class="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-200 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <span class="text-gray-700 font-medium text-lg">Transaction ID:</span>
      <span class="text-gray-900 text-lg font-semibold">{transaction.id}</span>
    </div>
    
    <div class="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-200 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <span class="text-gray-700 font-medium text-lg">Amount:</span>
      <span class="text-green-700 text-lg font-semibold">{transaction.amount}{transaction.currencyIsoCode}</span>
    </div>
    
    <div class="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-200 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <span class="text-gray-700 font-medium text-lg">Status:</span>
      <span class={`text-lg font-semibold ${transaction.status === 'authorized' ? 'text-green-700' : 'text-red-700'}`}>
        {transaction.status}
      </span>
    </div>

    <!-- Add more transaction details with similar styling -->
  </div>

  <footer class="mt-8 text-center">
    <a href="/hosted" class="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
      Make Another Payment
    </a>
  </footer>
</div>


{:else}
  <div class="max-w-4xl mx-auto mt-10 p-8 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
    <p class="text-gray-700 text-lg">Loading transaction details...</p>
  </div>
{/if}
  