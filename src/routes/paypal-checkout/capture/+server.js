import { json } from '@sveltejs/kit';
import { captureOrder, generateAccessToken } from '../../../api';

export async function POST({request}) {
    try {
        const { id } = await request.json();
        const accessToken = await generateAccessToken();
        const captureData = await captureOrder(accessToken.access_token, id);
        return json({captureData})
    } catch(error) {
        return json({ error: 'Failed to capture PayPal order' }, { status: 500 });
    }
}