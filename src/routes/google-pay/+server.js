import { json } from "@sveltejs/kit";
import { processTransaction } from '../../api';

export async function POST({ request }) {

    try {
        // Read the JSON body from the request
        const body = await request.json();

        const transactionDetails = {
            amount: 100,
            paymentMethodNonce: body.nonce, // Access nonce from the parsed body
        };

        const paymentId = await processTransaction(transactionDetails);
        return json({ paymentId });

    } catch (error) {
        console.error('Error in making a payment', error);
        return json({ success: false, error: error.message });
    }
}