<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let transaction;
    let error;
  
    // Retrieve the transaction ID from the URL
    const id = $page.params.id;

    onMount(async () => {
        try {
            const response = await fetch(`/paypal-checkout/${id}`);
            const data = await response.json();
            if (response.ok) {
                // Assuming `data` contains the transaction details
                transaction = data.transaction;
            } else {
                error = data.error || 'Failed to fetch transaction details';
            }
        } catch (err) {
            console.error('Error:', err);
            error = 'Failed to fetch transaction details';
        }
    });

    function startNewTransaction() {
        goto('/paypal-checkout/standard'); // Adjust to the actual route for starting a new transaction
    }
</script>

<div class="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-4">Transaction Details</h1>
    
    {#if error}
        <div class="mb-6">
            <p class="text-red-500">Error: {error}</p>
        </div>
    {:else if !transaction}
        <div class="mb-6">
            <p class="text-gray-500">Loading...</p>
        </div>
    {:else}
        <div class="mb-6">
            <h2 class="text-xl font-semibold">Transaction ID</h2>
            <p class="text-gray-700">{transaction.id}</p>
        </div>
      
        <div class="mb-6">
            <h2 class="text-xl font-semibold">Status</h2>
            <p class={`text-gray-700 ${transaction.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'}`}>{transaction.status}</p>
        </div>
      
        <div class="mb-6">
            <h2 class="text-xl font-semibold">Amount</h2>
            <p class="text-gray-700">
                {transaction.purchase_units[0].payments.captures[0].amount.currency_code} {transaction.purchase_units[0].payments.captures[0].amount.value}
            </p>
        </div>
      
        <div class="mb-6">
            <h2 class="text-xl font-semibold">Payer Information</h2>
            <p class="text-gray-700">Name: {transaction.payer.name.given_name} {transaction.payer.name.surname}</p>
            <p class="text-gray-700">Email: {transaction.payer.email_address}</p>
            <p class="text-gray-700">Country: {transaction.payer.address.country_code}</p>
        </div>
      
        <div class="mb-6">
            <h2 class="text-xl font-semibold">Payment Source</h2>
            <p class="text-gray-700">Email: {transaction.payment_source.paypal.email_address}</p>
            <p class="text-gray-700">Account ID: {transaction.payment_source.paypal.account_id}</p>
            <p class="text-gray-700">Account Status: {transaction.payment_source.paypal.account_status}</p>
        </div>
        {#if transaction.purchase_units[0].shipping}
        <div class="mb-6">
            <h2 class="text-xl font-semibold">Shipping Information</h2>
            <p class="text-gray-700">Full Name: {transaction.purchase_units[0].shipping.name.full_name}</p>
            <p class="text-gray-700">Address: {transaction.purchase_units[0].shipping.address.address_line_1}, {transaction.purchase_units[0].shipping.address.admin_area_2}, {transaction.purchase_units[0].shipping.address.admin_area_1} {transaction.purchase_units[0].shipping.address.postal_code}</p>
            <p class="text-gray-700">Country: {transaction.purchase_units[0].shipping.address.country_code}</p>
        </div>
        {/if}
    {/if}
</div>

<!-- Footer Section -->
<footer class="p-6 bg-gray-100 text-center border-t border-gray-200">
    <button 
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        on:click={startNewTransaction}
    >
        Start New Transaction
    </button>
</footer>