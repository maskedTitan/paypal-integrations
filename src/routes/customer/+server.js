import { updateCustomer, deleteCustomer } from '../../api/index.js';


export async function PUT({ request }) {
    const { customerId, updates } = await request.json();
    try {
        const updatedCustomer = await updateCustomer(customerId, updates);
        return new Response(JSON.stringify(updatedCustomer), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(error.message, { status: 400 });
    }
}

export async function DELETE({ request }) {
    const { customerId } = await request.json();
    try {
        await deleteCustomer(customerId);
        return new Response(JSON.stringify({ message: 'Customer deleted successfully.' }), { status: 200 });
    } catch (error) {
        return new Response(error.message, { status: 400 });
    }
}
