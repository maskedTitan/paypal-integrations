import { json } from '@sveltejs/kit';
import { processTransaction } from '../../api';

export async function POST({request}) {
    try {

        const data = await request.json();
        console.log('Fastlane nonce ', data);

        const transactionDetails = {
			amount: data.amount || 1,
			paymentMethodNonce: data.id
		}

        const paymentId = await processTransaction(transactionDetails);
        console.log('Fastlane Payment ID: ',paymentId);

        return json({success: true, payment: paymentId});
    } catch(error) {
        console.error('Error processing request:', error);
		return json({ success: false, error: error.message });
    }
}