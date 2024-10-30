import { json } from '@sveltejs/kit';
import { generateClientTokenWithMerchant } from '../../../api'

export async function POST({request}) {
  try {
    const data = await request.json();
    const token = await generateClientTokenWithMerchant(data.merchantAccountId);
    return json({ success: true, token })

  } catch(error) {
    return json({ success: false, error: error.message })
  }
};