import { json } from "@sveltejs/kit";
import { generateAccessToken, createPaymentToken } from "../../../../api";

export async function POST({ request }) {
  try {
    const { vaultSetupToken } = await request.json(); // Get vault setup token from the request body
    const { access_token } = await generateAccessToken('sandbox'); // Get PayPal access token

    const paymentTokenData = await createPaymentToken(access_token, vaultSetupToken); // Create the payment token
    console.log(paymentTokenData);
    
    return json({ paymentTokenData }); // Return the data using SvelteKit's json helper
  } catch (error) {
    console.error('Error creating saved payment token:', error);
    return json({ error: 'Failed to create a Saved Payment Token' }, { status: 500 }); // Error response
  }
}
