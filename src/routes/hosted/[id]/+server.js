import { json } from '@sveltejs/kit';
import { findTransaction } from '../../../api';

export async function GET({ params }) {
    const { id } = params;
  
    try {
      const transaction = await findTransaction(id);
      return json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return json({ error: 'Failed to fetch transaction details' }, { status: 500 });
    }
  }