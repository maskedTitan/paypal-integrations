<script>
    let payoutItems =[
        {
            "recipient_type": "EMAIL",
            "amount": {
                "value": "200",
                "currency": "CAD"
            },
            "note": "Thanks for your patronage!",
            "sender_item_id": "201403140001",
            "receiver": "harshamarri97+payout@gmail.com",
            "alternate_notification_method": {
                "phone": {
                    "country_code": "1",
                    "national_number": "9842860053"
                }
            },
            "notification_language": "fr-FR"
        },
        {
            "recipient_type": "PHONE",
            "amount": {
                "value": "112.34",
                "currency": "CAD"
            },
            "note": "Thanks for your support!",
            "sender_item_id": "201403140002",
            "receiver": "1-312-914-4604"
        },
        {
            "recipient_type": "PAYPAL_ID",
            "amount": {
                "value": "5.32",
                "currency": "CAD"
            },
            "note": "Thanks for your patronage!",
            "sender_item_id": "201403140003",
            "receiver": "G83JXTJ5EHCQ2",
            "purpose": "GOODS"
        }
    ];
  
    let payoutResult = null;
  let errorMessage = null;
  let errorDetails = null; // For detailed error info from PayPal

  async function handlePayout() {
    try {
      const response = await fetch('/paypal-payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payoutItems,
          env: 'sandbox' // Change this to 'production' for live
        })
      });

      const result = await response.json();

      if (response.ok) {
        payoutResult = result.payoutResult;
        errorMessage = null; // Clear any previous error
        errorDetails = null;  // Clear any detailed error
      } else {
        errorMessage = result.error;
        errorDetails = result.details; // Capture PayPal error details
      }
    } catch (error) {
      errorMessage = 'Failed to create PayPal payout';
      errorDetails = null;
      console.error(error);
    }
  }
</script>

<main class="p-8">
  <h1 class="text-2xl font-bold mb-4">PayPal Payouts Demo</h1>

  <button
    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    on:click={handlePayout}
  >
    Send Payout
  </button>

  {#if payoutResult}
    <h2 class="mt-4 text-xl font-semibold">Payout Result</h2>
    <pre>{JSON.stringify(payoutResult, null, 2)}</pre>
  {/if}

  {#if errorMessage}
    <p class="mt-4 text-red-600">{errorMessage}</p>

    {#if errorDetails}
      <h2 class="mt-4 text-xl font-semibold">Error Details</h2>
      <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
    {/if}
  {/if}
</main>

<style>
  main {
    font-family: 'Inter', sans-serif;
  }
</style>