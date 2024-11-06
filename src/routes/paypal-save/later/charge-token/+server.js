import { json } from "@sveltejs/kit";
import { generateAccessToken, createOrder } from '../../../../api';

export async function POST({ request }) {
    try {
        const { token } = await request.json();
        const { access_token } = await generateAccessToken('sandbox');
        const orderId = await createOrder(access_token, '100', 'sandbox', false, token);

        return json({ orderId })
    } catch(error) {
        console.error('Error charging token', error); // Log error
    }
};