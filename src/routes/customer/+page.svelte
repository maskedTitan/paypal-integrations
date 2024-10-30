<script>
  import PaymentMethodForm from "../../components/PaymentMethodForm.svelte";

    let customerId = '';
    let customerDetails = {};
    let updateDetails = '';
    let message = '';
    let showFullJson = false;


    async function getCustomer() {
        try {
            const response = await fetch(`/customer/${customerId}`);
            if (!response.ok) throw new Error(await response.text());
            customerDetails = await response.json();
            updateDetails = JSON.stringify(customerDetails, null, 2); // pre-fill update form as string
        } catch (error) {
            message = error.message;
        }
    }

    async function updateCustomerDetails() {
        try {
            const response = await fetch(`/customer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, updates: JSON.parse(updateDetails) }),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedCustomer = await response.json();
            message = 'Customer updated successfully.';
            customerDetails = updatedCustomer;
            updateDetails = JSON.stringify(updatedCustomer, null, 2);
        } catch (error) {
            message = error.message;
        }
    }

    async function deleteCustomerDetails() {
        try {
            const response = await fetch(`/customer`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId }),
            });
            if (!response.ok) throw new Error(await response.text());
            message = 'Customer deleted successfully.';
            customerDetails = {};
            updateDetails = '';
        } catch (error) {
            message = error.message;
        }
    }

    function toggleFullJson() {
        showFullJson = !showFullJson;
    }

    // Function to filter relevant payment method details
    function getFilteredPaymentMethods() {
        return customerDetails.paymentMethods?.map(method => ({
            cardType: method.cardType,
            last4: method.last4,
            expirationDate: method.expirationDate,
            imageUrl: method.imageUrl,
        })) || [];
    }

    function handleSubmit(event) {
        console.log(event);

    }

</script>

<div class="p-6 bg-gray-50 rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold mb-4 text-center text-gray-800">Customer Management</h1>
    <input
        type="text"
        bind:value={customerId}
        placeholder="Enter Customer ID"
        class="border border-gray-300 rounded-lg p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button on:click={getCustomer} class="bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 hover:bg-blue-700">Get Customer Details</button>

    {#if Object.keys(customerDetails).length > 0}
        <div class="mt-6 bg-white rounded-lg p-4 shadow-md">
            <h2 class="text-xl font-semibold text-gray-800">Customer Details</h2>
            <ul class="list-disc pl-5 text-gray-700">
                <li>ID: {customerDetails.id || 'N/A'}</li>
                <li>First Name: {customerDetails.firstName || 'N/A'}</li>
                <li>Last Name: {customerDetails.lastName || 'N/A'}</li>
                <li>Email: {customerDetails.email || 'N/A'}</li>
                <li>Phone: {customerDetails.phone || 'N/A'}</li>
            </ul>
            <h3 class="text-lg font-semibold mt-4">Payment Methods</h3>
            <ul class="list-disc pl-5 text-gray-700">
                {#each getFilteredPaymentMethods() as method}
                    <li>
                        <img src={method.imageUrl} alt={method.cardType} class="inline-block h-6 mr-2" />
                        {method.cardType} **** **** **** {method.last4} (Expires: {method.expirationDate})
                    </li>
                {/each}
            </ul>
            <button on:click={toggleFullJson} class="mt-2 text-blue-500 font-medium">
                {showFullJson ? 'Show Less' : 'Show Full JSON'}
            </button>

            {#if showFullJson}
                <div class="mt-4">
                    <pre class="bg-gray-100 p-4 border border-gray-300 rounded-lg">{JSON.stringify(customerDetails, null, 2)}</pre>
                </div>
            {/if}
        </div>

        <h2 class="text-xl font-semibold text-gray-800 mt-4">Update Customer Details</h2>
        <textarea
            bind:value={updateDetails}
            class="border border-gray-300 rounded-lg p-2 mb-4 h-48 w-full resize-none overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Edit customer details here..."
        ></textarea>
        <button on:click={updateCustomerDetails} class="bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300 hover:bg-green-700 mb-4">Update Customer</button>
        
        <button on:click={deleteCustomerDetails} class="bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 hover:bg-red-700">Delete Customer</button>

        <h2 class="text-xl font-semibold text-gray-800 mt-4">Add Payment Method</h2>
        <PaymentMethodForm 
        authorization='sandbox_ykmkmp4n_b6bnqwx858gzdsdc'
        onPaymentSuccess={handleSubmit}
        customerId={customerDetails.id}
        />     
       
    {/if}

    {#if message}
        <p class="mt-4 text-red-500 text-center font-semibold">{message}</p>
    {/if}
</div>

<style>
    /* Additional styles can be added here if necessary */
</style>
