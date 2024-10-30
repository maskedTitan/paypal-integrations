import { json } from "@sveltejs/kit";
import { generateAccessToken, createOrder } from "../../../api";

export async function POST() {
    try {
        // Destructure the result of generateAccessToken directly
        const { access_token, id_token } = await generateAccessToken('sandbox', true);
        
        // Use the destructured access_token to create an order
        const orderData = await createOrder(access_token, '24.99', 'sandbox', true);

        // Return the order data and id_token as a proper JSON response
        return json({ orderData, id_token });;

    } catch (error) {
        return json({ error: 'Failed to create a Saved PayPal order' }, { status: 500 });
    }
}
