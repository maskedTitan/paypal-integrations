import { json } from "@sveltejs/kit";
import { processTransaction } from "../../api";


export async function POST({request}) {
    try {
        const data = await request.json();
        const transactionDetails = {
            amount: 1,
            paymentMethodNonce: data.nonce,
            deviceData: data.deviceData
        }
        console.log(transactionDetails);
        const response = await processTransaction(transactionDetails);
        return json({success: true, response})
    } catch(error) {
        return json({ success: false, error: error.message });
    }
};