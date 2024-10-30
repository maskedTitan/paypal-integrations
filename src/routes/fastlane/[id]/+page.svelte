<script>
    import { page } from '$app/stores';
    import { paymentDetails } from '../../../api/store';
    let transactionId;

    $: ({ status, amount, message, last4, cardType, maskedNumber } = $paymentDetails);

    $: transactionId = $page.params.id;
    let transaction;

    export async function load({params, session, fetch, url}) {
        transaction = url.state.id;
        console.log(transaction);

        return {
      props: {
        transaction
      }
    };
    }
  </script>
  
  <main class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-6 text-center font-sans">
        Transaction Details
      </h1>
  
      <div class="space-y-4">
        <p class="text-lg font-medium text-gray-700">
          <span class="text-gray-500">Transaction ID:</span> {transactionId}
        </p>
  
        <p class="text-lg font-medium text-gray-700">
          <span class="text-gray-500">Status:</span> 
          <span class={status === 'authorized' ? 'text-green-600' : 'text-red-600'}>{status}</span>
        </p>
  
        <p class="text-lg font-medium text-gray-700">
          <span class="text-gray-500">Amount:</span> ${amount}
        </p>

        <p class="text-lg font-medium text-gray-700">
          <span class="text-gray-500">Card Type:</span> {cardType}
        </p>

        <p class="text-lg font-medium text-gray-700">
          <span class="text-gray-500">Card Last 4:</span> {last4}
        </p>

        <p class="text-lg font-medium text-gray-700">
          <span class="text-gray-500">Card Masked Number:</span> {maskedNumber}
        </p>
  
        {#if message}
          <div class="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md">
            <p class="text-sm">{message}</p>
          </div>
        {/if}
        <a href="/fastlane" target="_blank" class="inline-block mt-6 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white font-medium transition">
          Make another transaction
        </a> 
      </div>
    </div>
  </main>
  
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
  
    :global(body) {
      font-family: 'Poppins', sans-serif;
    }
  </style>  
  