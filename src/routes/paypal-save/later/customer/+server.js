import { json } from "@sveltejs/kit";
import { generateAccessToken, getPaymentTokens } from '../../../../api';

export async function POST({ request }) {
  try {
    const { customer_id } = await request.json(); // Retrieve customer ID from the request body
    const { access_token } = await generateAccessToken('sandbox'); // Fetch access token

    const paymentTokens = await getPaymentTokens(access_token, customer_id); // Fetch saved payment methods

    return json({ paymentTokens });
  } catch (error) {
    console.error('Error retrieving payment tokens:', error); // Log error
    return json({ error: 'Failed to retrieve payment tokens' }, { status: 500 });
  }
}
