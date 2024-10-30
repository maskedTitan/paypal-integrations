import { json } from "@sveltejs/kit";
import { processTransaction } from "../../api";

export async function POST({request}) {
    try {
        const data = await request.json();
        const transactionDetails = {
            amount: data.amount,
           // paymentMethodNonce: data.nonce
           'payment_method_token': data.nonce
        };
        const response = await processTransaction(transactionDetails);
            return json({ response });
    }
    catch(error) {
        return json({ success: false, error: error.message });
    }
}