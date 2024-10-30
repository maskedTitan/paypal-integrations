import { json } from '@sveltejs/kit';
import { generateAccessToken, createOrder } from '../../../api';

export async function POST() {

        try {
            const accessToken = await generateAccessToken();
            console.log(accessToken)
            const orderData = await createOrder(accessToken.access_token, '100.0', 'sandbox', true);
            return json({orderData});
        } catch(error) {
            return json({ error: 'Failed to capture PayPal order' }, { status: 500 });
        }

};