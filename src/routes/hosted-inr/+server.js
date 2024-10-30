import { json } from '@sveltejs/kit';
import { processTransaction } from '../../api';

export async function POST({ request }) {
    try {
        const data = await request.json();
        const transactionDetails = {
            amount: data.amount,
            paymentMethodNonce: data.nonce,
            deviceData: data.deviceData,
            merchantAccountId: 'indian_currency_test' // remove it for hosted and make it unique for hosted-inr
        }
        console.log(transactionDetails)
        const paymentId = await processTransaction(transactionDetails);
        return json({success:true, payment:paymentId});
    } catch(error) {
        console.error('Error in making a payment',error);
        return json({ success: false, error: error.message });
    }
}