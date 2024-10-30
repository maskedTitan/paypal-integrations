import { json } from '@sveltejs/kit';
import { generateClientToken, processTransaction, createCustomer } from '../../api/';


export async function POST({ request }) {
	try {
		const clientToken = await generateClientToken();
		//const clientToken = await generateClientTokenWithCustomer('51768907481');
		const data = await request.json();

		const tokenId = data.tokenId;

        const customerDetails = {
            firstName: "Harsha",
            lastName: "Marri",
            company: "Braintree",
            email: "hmarri@paypal.com",
            phone: "984.286.0063",
            fax: "614.555.5678",
            website: "www.paypal.com"
        }

        const customerId = await createCustomer(customerDetails);

		const transactionDetails = {
			amount: '10',
			paymentMethodNonce: tokenId,
			options: {
			submitForSettlement: true
			},
			deviceData: data.deviceData
		};
		console.log(transactionDetails)
		const paymentId = await processTransaction(transactionDetails);

		return json({ success: true , payment: paymentId});
	} catch (error) {
		console.error('Error processing request:', error);
		// @ts-ignore
		return json({ success: false, error: error.message });
	}
}