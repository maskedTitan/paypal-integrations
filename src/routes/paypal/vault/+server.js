import { json } from '@sveltejs/kit';
import { processTransaction } from '../../../api'

export async function POST({request}) {
    try {
        const data = await request.json();
        const saleData = {
            amount: '100',
            paymentMethodNonce: data.tokenId,
            options: {
                storeInVault: true
            }
        };
        const response = await processTransaction(saleData);
        return json({response});

    } catch(error) {
        return json({ success: false, error: error.message });
    }
};