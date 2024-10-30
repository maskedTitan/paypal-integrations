import { generateClientToken } from '../../api';

export async function load({params}) {
    return {
        params: await generateClientToken()
    }
};