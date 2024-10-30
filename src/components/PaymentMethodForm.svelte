<script>
    import { onMount } from 'svelte';

    export let authorization = ''; // Braintree authorization key
    export let onPaymentSuccess; // Callback for successful payment
    export let customerId; // Customer required to make a payment method

    let form;
    let submitButton;
    let hostedFieldsInstance;
    let collectedDeviceData;

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
                }, (err, dataCollectorInstance) => {
                    if (err) {
                        reject(err);
                        return;
                    }

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
                        'font-size': '16px',
                        'font-family': 'Arial, sans-serif',
                        'font-weight': '500',
                        'padding': '0.75rem',
                        'border-radius': '0.375rem',
                        'border-width': '2px',
                        'border-color': '#e5e7eb',
                        'box-shadow': '0 1px 3px rgba(0,0,0,0.1)',
                        'transition': 'all 0.3s ease-in-out'
                    },
                    'input::placeholder': {
                        'color': '#9ca3af',
                        'opacity': '1',
                        'font-weight': '400'
                    },
                    'input.invalid': {
                        'color': '#f87171',
                        'border-color': '#f87171',
                        'box-shadow': '0 1px 3px rgba(248, 113, 113, 0.3)',
                        'font-weight': '500'
                    },
                    'input.valid': {
                        'color': '#34d399',
                        'border-color': '#34d399',
                        'box-shadow': '0 1px 3px rgba(52, 211, 153, 0.3)',
                        'font-weight': '500'
                    },
                    'input:focus': {
                        'border-color': '#10b981',
                        'box-shadow': '0 0 0 2px rgba(16, 185, 129, 0.3)',
                        'font-weight': '500'
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

    async function sendTokenToServer(nonce, deviceData) {
        try {
            const response = await fetch('/api/payment-method', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nonce, deviceData, customerId })
            });
            const data = await response.json();
            if (data.success) {
                onPaymentSuccess(data);
                //goto(`/hosted/${data.payment.transaction.id}`);
            }
        } catch (error) {
            console.error('Error sending to server', error);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!hostedFieldsInstance) return;

        hostedFieldsInstance.tokenize((err, payload) => {
            if (err) {
                console.error(err);
                return;
            }

            sendTokenToServer(payload.nonce, collectedDeviceData);
        });
    }

    // Initialize Braintree components when the component mounts
    onMount(async () => {
        try {
            const { clientInstance, deviceData } = await createBraintreeClient();
            hostedFieldsInstance = await createHostedFields(clientInstance);
            submitButton.removeAttribute('disabled');
            collectedDeviceData = deviceData;
            console.log('Device Data:', deviceData);
        } catch (err) {
            console.error('Error initializing Braintree:', err);
        }
    });
</script>

<div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Add Payment Method</h1>
    <p class="text-gray-600 mb-6">
      Please enter your payment details below. Your payment information is securely processed by Braintree.
    </p>

    <form bind:this={form} on:submit={handleSubmit} id="my-sample-form" method="post" class="space-y-6">
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

        <input bind:this={submitButton} type="submit" value="Add Payment Method" disabled class="w-full bg-green-500 text-white px-4 py-3 rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out" />
    </form>
    <footer class="mt-8 text-center">
        <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
    </footer>
</div>

<style>
    /* Additional styles can be added here if necessary */
</style>
