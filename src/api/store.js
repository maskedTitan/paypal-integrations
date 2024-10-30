import { writable } from 'svelte/store';

export const paymentDetails = writable({
    status: '',
    amount: 0,
    message: '',
    last4: 0,
    cardType: '',
    maskedNumber: ''
})

export const tokenStore = writable(''); // This is where the token will be stored
