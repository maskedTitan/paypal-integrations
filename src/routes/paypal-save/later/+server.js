import { json } from "@sveltejs/kit";
import { generateAccessToken, createVaultSetupToken } from "../../../api";

export async function POST() {
    try {
        const { access_token } = await generateAccessToken('sandbox');
        const setupTokenResponse = await createVaultSetupToken(access_token);

        return json({ setupTokenResponse });

    } catch (error) {
        return json({ error: 'Failed to create a Vault Setup Token' }, { status: 500 });
    }
};