import { json } from "@sveltejs/kit";
import { generateAccessToken, createPayPalPayout } from '../../api';

export async function POST({ request }) {
    try {
        const { payoutItems, env } = await request.json();  // Get payout items and env from the request body
        
        const accessToken = await generateAccessToken(env); // Generate access token based on env (sandbox or production)
        const payoutResult = await createPayPalPayout(accessToken, payoutItems, env); // Create PayPal payout

        return json({ payoutResult });
    } catch (error) {
        console.error('Error creating PayPal payout:', error);

        // Check if it's a PayPal API error
        if (error.response && error.response.json) {
            const errorDetails = await error.response.json(); // Get detailed error from PayPal's response
            return json({ error: 'PayPal API error', details: errorDetails }, { status: error.response.status });
        }

        // Return a generic error if there's no specific PayPal error
        return json({ error: 'Failed to create PayPal payout', message: error.message }, { status: 500 });
    }
}