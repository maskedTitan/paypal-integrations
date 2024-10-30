import { json } from '@sveltejs/kit';
import { processTransaction } from '../../api'

export async function POST({ request }) {
    try {
        const data = await request.json();

        const saleData = {
            amount: '1',
            paymentMethodNonce: data.tokenId,
            deviceData: data.devideData
        }
        const paymentId = await processTransaction(saleData);
        return json({success: true, payment: paymentId})
    } catch(error) {
        console.error('Error processing request:', error);
		return json({ success: false, error: error.message });
    }
}