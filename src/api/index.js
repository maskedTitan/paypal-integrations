import braintree from 'braintree';
import dotenv from 'dotenv';

dotenv.config();

const gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: process.env.BRAINTREE_MERCHANT_ID,
	publicKey: process.env.BRAINTREE_PUBLIC_KEY,
	privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

 /**
 * Generate a client token with Braintree.
 * 
 * @returns {Promise<string>} - The client token.
 */
export async function generateClientToken() {
    try {
      const result = await new Promise((resolve, reject) => {
        gateway.clientToken.generate({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.clientToken);
          }
        });
      });
      return result;
    } catch (error) {
      console.error('Error generating client token:', error);
      throw error;
    }
  }

  /**
 * Generate a client token on a Customer ID with Braintree.
 *
 * @param {string} customerId - The ID of the customer.
 * @returns {Promise<string>} - The client token.
 */
export async function generateClientTokenWithCustomer(customerId) {
  try {
    const response = await new Promise((resolve, reject) => {
      gateway.clientToken.generate({ customerId }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    if (response.clientToken) {
      return response.clientToken;
    } else {
      console.error('Client token generation failed');
      throw new Error('Client token generation failed');
    }
  } catch (error) {
    console.error('Error generating client token:', error);
    throw error;
  }
}

/**
 * Generate a client token with a Merchant Account ID using Braintree.
 *
 * @param {string} merchantAccountId - The ID of the merchant account.
 * @returns {Promise<string>} - The client token.
 */
export async function generateClientTokenWithMerchant(merchantAccountId) {
  try {
    const response = await new Promise((resolve, reject) => {
      gateway.clientToken.generate({ merchantAccountId }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    if (response.clientToken) {
      return response.clientToken;
    } else {
      console.error('Client token generation failed');
      throw new Error('Client token generation failed');
    }
  } catch (error) {
    console.error('Error generating client token:', error);
    throw error;
  }
}


  /**
 * Process a transaction with Braintree.
 *
 * @param {Object} transactionDetails - The details of the transaction.
 * @returns {Promise<Object>} - The result of the transaction.
 */
export async function processTransaction(transactionDetails) {
  try {
    const result = await new Promise((resolve, reject) => {
      gateway.transaction.sale(transactionDetails, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result) {
      return result;
    } else {
      console.error('Transaction failed:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    throw error;
  }
}

/**
 * Find a transaction by ID using Braintree.
 * 
 * @param {string} transactionId - The ID of the transaction to find.
 * @returns {Promise<object>} - The transaction details.
 */
export async function findTransaction(transactionId) {
  try {
      const result = await new Promise((resolve, reject) => {
          gateway.transaction.find(transactionId, (err, transaction) => {
              if (err) {
                  reject(err);
              } else {
                  resolve(transaction);
              }
          });
      });
      return result;
  } catch (error) {
      console.error('Error finding transaction:', error);
      throw error;
  }
}

/**
 * Create a customer with Braintree.
 *
 * @param {Object} customerDetails - The details of the customer.
 * @returns {Promise<Object>} - The result of the customer creation.
 */
export async function createCustomer(customerDetails) {
    try {
      const result = await new Promise((resolve, reject) => {
        gateway.customer.create(customerDetails, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
  
      if (result.success) {
        return result;
      } else {
        console.error('Customer creation failed:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
 * Find a customer by ID using Braintree.
 * 
 * @param {string} customerId - The ID of the customer to find.
 * @returns {Promise<object>} - The customer details.
 * @throws {Error} - Throws an error if the customer ID is not provided or if an error occurs during retrieval.
 */
export async function findCustomerById(customerId) {
  if (!customerId) {
      throw new Error("Customer ID is required.");
  }

  try {
      const customer = await new Promise((resolve, reject) => {
          gateway.customer.find(customerId, (err, customer) => {
              if (err) {
                  reject(err);
              } else {
                  resolve(customer);
              }
          });
      });
      return customer;
  } catch (error) {
      console.error('Error finding customer:', error);
      throw error;
  }
}

/**
 * Update a customer's details using Braintree.
 * 
 * @param {string} customerId - The ID of the customer to update.
 * @param {object} updates - The details to update.
 * @returns {Promise<object>} - The updated customer details.
 * @throws {Error} - Throws an error if the customer ID is not provided or if an error occurs during update.
 */
export async function updateCustomer(customerId, updates) {
  if (!customerId || !updates) {
      throw new Error("Customer ID and updates are required.");
  }

  try {
      const customer = await new Promise((resolve, reject) => {
          gateway.customer.update(customerId, updates, (err, result) => {
              if (err) {
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      });
      return customer;
  } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
  }
}

/**
* Delete a customer using Braintree.
* 
* @param {string} customerId - The ID of the customer to delete.
* @returns {Promise<object>} - The result of the deletion.
* @throws {Error} - Throws an error if the customer ID is not provided or if an error occurs during deletion.
*/
export async function deleteCustomer(customerId) {
  if (!customerId) {
      throw new Error("Customer ID is required.");
  }

  try {
      const result = await new Promise((resolve, reject) => {
          gateway.customer.delete(customerId, (err, result) => {
              if (err) {
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      });
      return result;
  } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
  }
}


  /**
 * Find a payment method using a token with Braintree.
 *
 * @param {string} token - The token of the payment method.
 * @returns {Promise<object>} - The payment method details.
 */
export async function findPaymentMethodByToken(token) {
  try {
    const paymentMethod = await new Promise((resolve, reject) => {
      gateway.paymentMethod.find(token, (err, paymentMethod) => {
        if (err) {
          reject(err);
        } else {
          resolve(paymentMethod);
        }
      });
    });
    return paymentMethod;
  } catch (error) {
    throw new Error(`Failed to find payment method: ${error.message}`);
  }
}

/**
 * Create a payment method for a customer with Braintree.
 *
 * @param {string} customerId - The ID of the customer.
 * @param {string} paymentMethodNonce - The payment method nonce from the client.
 * @returns {Promise<Object>} - The result of the payment method creation.
 */
export async function createPaymentMethod(customerId, paymentMethodNonce) {
  try {
    const result = await new Promise((resolve, reject) => {
      gateway.paymentMethod.create({
        customerId: customerId,
        paymentMethodNonce: paymentMethodNonce
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.success) {
      return result;
    } else {
      console.error('Payment method creation failed:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
}



/**
 * Generate an access token for PayPal API requests.
 *
 * This function retrieves an OAuth 2.0 access token for authenticating API requests
 * to the PayPal platform. It supports both sandbox and production environments.
 * 
 * Additionally, the function allows passing an optional `response_type` parameter
 * for specific use cases like saving a payment method.
 *
 * @param {string} [env='sandbox'] - The environment to use, either 'sandbox' or 'production'.
 * @param {boolean} [enableResponseType=false] - Whether to include the response_type parameter (for saving payment methods).
 * @returns {Promise<string>} - The access token required to authenticate PayPal API requests.
 * @throws {Error} - Throws an error if the token generation fails.
 */
export async function generateAccessToken(env = 'sandbox', enableResponseType = false) {
  // Define credentials for both environments
  const clientIdSandbox = process.env.PAYPAL_CLIENT_ID_SANDBOX;
  const clientSecretSandbox = process.env.PAYPAL_CLIENT_SECRET_SANDBOX;

  const clientIdProd = process.env.PAYPAL_CLIENT_ID_PROD;
  const clientSecretProd = process.env.PAYPAL_CLIENT_SECRET_PROD;

  // Determine credentials and URL based on environment
  const clientId = env === 'production' ? clientIdProd : clientIdSandbox;
  const clientSecret = env === 'production' ? clientSecretProd : clientSecretSandbox;
  const url = env === 'production' 
    ? 'https://api-m.paypal.com/v1/oauth2/token' 
    : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

  const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Create the form data, including response_type if enabled
  const bodyParams = new URLSearchParams({
    grant_type: 'client_credentials',
  });

  if (enableResponseType) {
    bodyParams.append('response_type', 'id_token');
    bodyParams.append('target_customer_id', 'tOqsNyKMEB');
  }
  // PayPal saved customer - wGjLXACwHL

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${encodedCredentials}`
          },
          body: bodyParams
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Return both access_token and id_token (if present)
      return {
        access_token: data.access_token,
        id_token: data.id_token ? data.id_token : null  // Include id_token if response_type was requested
      };
  } catch (error) {
      console.error('Error generating access token:', error);
      throw error;
  }
}



/**
 * Generates a random Request ID (version 4).
 * 
 * @returns {string} - The generated UUID.
 */
function generateUUID() {
  
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

/**
 * Create an order with PayPal.
 *
 * This function uses the PayPal API to create a new order with the specified details.
 * The order includes information such as the amount, currency, payment preferences,
 * and optionally the ability to store the payment method for future use.
 * 
 * The function can create both regular and saved orders depending on the 
 * `savePaymentMethod` parameter.
 *
 * @param {string} accessToken - The access token to authorize the request.
 * @param {string} [amount='100.00'] - The amount to charge for the order.
 * @param {string} [env='sandbox'] - The PayPal environment to use ('sandbox' or 'production').
 * @param {boolean} [savePaymentMethod=false] - Whether to store the payment method in the PayPal vault for future purchases.
 * @returns {Promise<Object>} - The result of the order creation, including the order ID and other details.
 * @throws {Error} - Throws an error if the request fails.
 */

export async function createOrder(
  accessToken,
  amount = "100.00",
  environment = "sandbox",
  saveToVault = false,
  vaultId = null
) {
  try {
    const referenceId = generateUUID();
    const url =
      environment === "production"
        ? "https://api-m.paypal.com/v2/checkout/orders"
        : "https://api-m.sandbox.paypal.com/v2/checkout/orders";

    // Construct the default payload
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          amount: {
            currency_code: "USD",
            value: amount
          }
        }
      ]
    };

    // Check if a vault ID is provided for using a saved card
    if (vaultId) {
      payload.payment_source = {
        card: {
          vault_id: vaultId
        }
      };
    } else {
      // Default to using PayPal as the payment source
      payload.payment_source = {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "PRODUCT BYTES",
            landing_page: "LOGIN",
            shipping_preference: "NO_SHIPPING",
            return_url: "https://example.com/returnUrl",
            cancel_url: "https://example.com/cancelUrl"
          }
        }
      };
      
      // Only include vault attributes if `saveToVault` is true
      if (saveToVault) {
        payload.payment_source.paypal.attributes = {
          vault: {
            store_in_vault: "ON_SUCCESS",
            usage_type: "MERCHANT"
          }
        };
      }
    }

    // Send the request to PayPal
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        'PayPal-Request-Id': generateUUID(), // Ensure the request ID is unique per request
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}



/**
 * Capture a PayPal order.
 *
 * @param {string} accessToken - The access token for authorization.
 * @param {string} orderId - The ID of the order to capture.
 * @param {string} [env='sandbox'] - The environment ('sandbox' or 'production').
 * @returns {Promise<Object>} - The result of the order capture.
 */
export async function captureOrder(accessToken, orderId, env = 'sandbox') {
  try {
    // Determine the correct PayPal URL based on environment
    const url = env === 'production'
      ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`
      : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error capturing order:', error);
    throw error;
  }
}

/**
 * Fetch details of a PayPal order by ID.
 * 
 * @param {string} orderId - The ID of the PayPal order to fetch.
 * @param {string} accessToken - The access token for authorization.
 * @param {string} [env='sandbox'] - The environment ('sandbox' or 'production').
 * @returns {Promise<object>} - The details of the PayPal order.
 */
export async function fetchPayPalOrder(orderId, accessToken, env = 'sandbox') {
  try {
    // Determine the correct PayPal URL based on environment
    const url = env === 'production'
      ? `https://api-m.paypal.com/v2/checkout/orders/${orderId}`
      : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching PayPal order: ${response.statusText}`);
    }

    const orderDetails = await response.json();
    return orderDetails;
  } catch (error) {
    console.error('Error fetching PayPal order:', error);
    throw error;
  }
}

/**
 * Create a PayPal payout.
 *
 * @param {string} accessToken - The access token for authorization.
 * @param {Array} payoutItems - The array of payout items (recipient type, amount, receiver, etc.).
 * @param {string} [env='sandbox'] - The environment ('sandbox' or 'production').
 * @returns {Promise<Object>} - The result of the payout request.
 */
export async function createPayPalPayout(accessToken, payoutItems, env = 'sandbox') {
  try {
    // Determine the correct PayPal URL based on environment
    const url = env === 'production'
      ? 'https://api-m.paypal.com/v1/payments/payouts'
      : 'https://api-m.sandbox.paypal.com/v1/payments/payouts';

    const senderBatchId = `Payouts_${new Date().getTime()}`;  // Generate a unique batch ID

    const payload = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: "You have a payout!",
        email_message: "You have received a payout! Thanks for using our service!"
      },
      items: payoutItems  // Pass the dynamic payout items
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating PayPal payout:', error);
    throw error;
  }
}
/**
 * Create a Vault Setup Token
 * 
 * @param {string} accessToken - PayPal access token for authorization.
 * @param {string} requestId - Unique PayPal Request ID.
 * @returns {Object} - The response from PayPal containing the setup token.
 */
export async function createVaultSetupToken(accessToken) {
    try {
        const response = await fetch('https://api-m.sandbox.paypal.com/v3/vault/setup-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'PayPal-Request-Id': generateUUID(), // Ensure the request ID is unique per request
            },
            body: JSON.stringify({
                payment_source: {
                    card: {}
                },
                customer: {
                  id: 'tOqsNyKMEB'
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`PayPal API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating Vault Setup Token:', error);
        throw error;
    }
}

/**
 * Function to create a payment token using a vault setup token
 * 
 * @param {string} accessToken - PayPal access token for the API.
 * @param {string} vaultSetupToken - The vault setup token returned from the client-side onApprove method.
 * @returns {Promise<Object>} - The payment token returned from the PayPal API.
 */
export async function createPaymentToken(accessToken, vaultSetupToken) {
  try {
    const requestId = generateUUID(); // Generate a unique request ID

    const response = await fetch('https://api-m.sandbox.paypal.com/v3/vault/payment-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Replace with your app's access token
        'PayPal-Request-Id': requestId, // Use a unique request ID
      },
      body: JSON.stringify({
        payment_source: {
          token: {
            id: vaultSetupToken, // Use the vault setup token from the client-side
            type: 'SETUP_TOKEN'
          }
        }
      }),
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the payment token
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw error;
  }
}

/**
 * Function to get saved payment tokens for a specific customer
 *
 * @param {string} accessToken - PayPal access token for authorization
 * @param {string} customerId - The customer ID from the frontend
 * @returns {Promise<Object>} - The response containing the payment tokens
 */
export async function getPaymentTokens(accessToken, customerId) {
  try {
    const response = await fetch(`https://api-m.sandbox.paypal.com/v3/vault/payment-tokens?customer_id=${customerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Payment Tokens:', data); // Log the response for debugging
    return data;
  } catch (error) {
    throw error;
  }
}


