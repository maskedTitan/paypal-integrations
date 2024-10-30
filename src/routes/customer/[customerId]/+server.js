import { findCustomerById } from '../../../api';

export async function GET({ params }) {
    const { customerId } = params;
    try {
        const customer = await findCustomerById(customerId);
        return new Response(JSON.stringify(customer), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(error.message, { status: 400 });
    }
}