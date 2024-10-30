import { generateClientTokenWithCustomer } from '../../../api'

export async function load() {
    return {
        token: await generateClientTokenWithCustomer('51768907481')
    }
}