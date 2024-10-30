import { json } from "@sveltejs/kit";
import { fetchPayPalOrder, generateAccessToken } from '../../../api';

export async function GET({ params }) {
    const { id } = params;
    try {
        const accessToken = await generateAccessToken();
        const transaction = await fetchPayPalOrder(id, accessToken.access_token);
        return json({transaction});
    } catch(error) {
        console.error('Error fetching transaction:', error);
        return json({ error: 'Failed to fetch transaction details' }, { status: 500 });
    }
};