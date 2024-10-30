<script>

import { onMount, tick } from "svelte";
import { fade } from "svelte/transition";
import { goto } from '$app/navigation';

import { paymentDetails } from '../../api/store';

import Loader from "../../components/Loader.svelte";
import PayPalButton from "../../components/PayPalButton.svelte";

let statement = "Fastlane Demo";
export let data;
const clientToken = data.params;

let fastlane, identity, profile;
let email, errorMessage, emailError, paymentId, amountError = "";
let renderFastlaneMemberExperience, showErrorMessage, fastlaneInitialized, loading, isMembershipChecked = false;
let profileData = null;
let shippingAddress = null;
let showGuestCheckout = false;

//Store variables re-initialize :/
let status = '';
let amount, last4 = 0;
let message, cardType, maskedNumber = '';

$: ({status, amount, message, last4, cardType, maskedNumber} = paymentDetails);

onMount(async () => {
  try {
    const clientInstance = await braintree.client.create({
      authorization: clientToken,
    });

    const dataCollectorInstance = await braintree.dataCollector.create({
      client: clientInstance,
      riskCorrelationId: "<SESSION ID>",
    });

    const deviceData = dataCollectorInstance.deviceData;

    fastlane = await braintree.fastlane.create({
      authorization: clientToken,
      client: clientInstance,
      deviceData: deviceData,
    });
    console.log(fastlane);

    identity = fastlane.identity;
    profile = fastlane.profile;

    window.localStorage.setItem("fastlaneEnv", "sandbox");
    fastlane.setLocale("en_us");

    fastlaneInitialized = true;
    // Render the watermark after Fastlane initialization
    const fastlaneWatermark = await fastlane.FastlaneWatermarkComponent({
      includeAdditionalInfo: true,
    });
    await fastlaneWatermark.render("#watermark-container");
  } catch (error) {
    console.error("Error initializing Fastlane:", error);
    errorMessage = "Error initializing Fastlane. Please try again.";
    showErrorMessage = true;
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function handleEmailChange(event) {
  email = event.target.value;
  emailError = "";

  if (!validateEmail(email)) {
    emailError = "Please enter a valid email address.";
  }
}

async function checkFastlaneMembership() {
    loading = true;
    isMembershipChecked = true;
  if (!fastlaneInitialized) {
    errorMessage = "Fastlane is not initialized. Please wait...";
    showErrorMessage = true;
    hideErrorMessageAfterDelay();
    return;
  }

  try {
    const { customerContextId } = await identity.lookupCustomerByEmail(email);

    if (customerContextId) {
      const { authenticationState, profileData: retrievedProfileData } =
        await identity.triggerAuthenticationFlow(customerContextId);

      if (authenticationState === "succeeded") {
        renderFastlaneMemberExperience = true;
        profileData = retrievedProfileData;
        shippingAddress = profileData.shippingAddress;
        console.log(shippingAddress);
        showErrorMessage = false;
      } else {
        renderFastlaneMemberExperience = false;
        errorMessage = "Authentication failed. Please try again.";
        showErrorMessage = true;
        hideErrorMessageAfterDelay();
      }
    } else {
      renderFastlaneMemberExperience = false;
      errorMessage = "No membership found for the provided email.";
      showErrorMessage = true;
      hideErrorMessageAfterDelay();
    }
  } catch (error) {
    console.error("Error during Fastlane membership check:", error);
    errorMessage = "Error during membership check. Please try again.";
    showErrorMessage = true;
    hideErrorMessageAfterDelay();
  } finally {
    loading = false;
  }
}

let fastlanePaymentComponent;

async function renderShippingAndPaymentComponent() {
    if (!fastlaneInitialized) {
      errorMessage = "Fastlane is not initialized. Please wait...";
      showErrorMessage = true;
      hideErrorMessageAfterDelay();
      return;
    }

    if (renderFastlaneMemberExperience && profileData?.shippingAddress) {
      await tick();

      const changeAddressButton = document.getElementById("your-change-address-button");
      if (changeAddressButton) {
        changeAddressButton.addEventListener("click", async () => {
          const { selectedAddress, selectionChanged } =
            await profile.showShippingAddressSelector();

          if (selectionChanged) {
            shippingAddress = selectedAddress;
          }
        });
      }
    } else {
      const form = document.getElementById('shipping-address-form');
      if (form) {
            form.addEventListener('submit', (event) => {
            event.preventDefault();
            shippingAddress = {
                  company: '',
                  streetAddress: '',
                  extendedAddress: '',
                  locality: '',
                  region: '',
                  postalCode: '',
                  countryCodeAlpha2: '',
                  phoneNumber: '',
      };
      // Optionally, you can add logic here to save or use the address data
    });
  }
      shippingAddress = {
        company: "Braintree",
        streetAddress: "1 E 1st St",
        extendedAddress: "5th Floor",
        locality: "Bartlett",
        region: "IL",
        postalCode: "60103",
        countryCodeAlpha2: "US",
        phoneNumber: "14155551212",
      };
    }
    //To-Do diplay the shipping address

    if (fastlane) {
      const options = {
        fields: {
          phoneNumber: { prefill: "4026607986" },
        },
        styles: {
          root: { backgroundColorPrimary: "#b82303" },
        },
      };

      try {
         fastlanePaymentComponent = await fastlane.FastlanePaymentComponent({
          options,
          shippingAddress,
        });

        await fastlanePaymentComponent.render("#payment-container");
      } catch (error) {
        console.error("Error initializing Fastlane Payment Component:", error);
        errorMessage = "Error initializing payment component. Please try again.";
        showErrorMessage = true;
        hideErrorMessageAfterDelay();
      }
    } else {
      console.error("Fastlane is not initialized");
      errorMessage = "Fastlane is not initialized. Please refresh the page.";
      showErrorMessage = true;
      hideErrorMessageAfterDelay();
    }
  }

  function validateAmount() {
    if (amount < 1 || amount > 10000) {
      amountError = 'Please enter a valid amount between $1 and $10,000.';
      amount = Math.max(1, Math.min(amount, 10000)); // Auto-correct to the nearest valid amount
    } else {
      amountError = '';
    }
  }

  async function handleSubmit() {
    validateAmount();
    try {
      const { id } = await fastlanePaymentComponent.getPaymentToken();
      console.log("Payment Token ID:", id);

      const response = await fetch('/fastlane', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id, amount})
      })
      const data = await response.json();
      console.log('Server Response', data.payment);
      paymentDetails.set({
        status: data.payment.transaction.status,
        amount: data.payment.transaction.amount,
        message: data.payment.message,
        last4: data.payment.transaction.creditCard.last4,
        cardType: data.payment.transaction.creditCard.cardType,
        maskedNumber: data.payment.transaction.creditCard.maskedNumber
      })
      goto(`/fastlane/${data.payment.transaction.id}`, {
        state: data.payment.transaction
      });
    } catch (error) {
      console.error("Error getting payment token:", error);
      errorMessage = "Error processing payment. Please try again.";
      showErrorMessage = true;
      hideErrorMessageAfterDelay();
    }
  }

$: if (fastlaneInitialized && renderFastlaneMemberExperience !== undefined) {
  renderShippingAndPaymentComponent();
}

function hideErrorMessageAfterDelay() {
  setTimeout(() => {
    showErrorMessage = false;
  }, 5000); // Hide after 5 seconds
}

</script>
  
  <main class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
      {#if loading}
        <Loader />
      {:else}
      <h1 class="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        {statement}
      </h1>

        <div class="space-y-4">
          <!-- Amount Input Field -->
    <div class="mt-6">
      <label for="amount" class="block text-sm font-medium text-gray-700">Enter Amount (Max: $10,000):</label>
      <input
        type="number"
        id="amount"
        bind:value={amount}
        class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        placeholder="Enter amount"
        min="1"
        max="10000"
        required
      />
      {#if amountError}
        <p class="text-red-600 text-sm mt-2">{amountError}</p>
      {/if}
      <!-- PayPal Button Upstream -->
      <PayPalButton 
      CLIENT_AUTHORIZATION={import.meta.env.VITE_BRAINTREE_TOKENIZATION_KEY} 
      route="paypal"
      />
    </div>
          <div>
            <p class="text-center text-gray-500 my-4 font-medium">OR</p>
            <p class="text-center text-blue-600 font-semibold hover:underline cursor-pointer">Checkout As Guest</p>

            <label for="email" class="block text-sm font-medium text-gray-700">Enter your email:</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              on:input={handleEmailChange}
              class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              placeholder="you@example.com"
              required
            />
            {#if emailError}
              <p class="text-red-600 text-sm mt-2">{emailError}</p>
            {/if}
            <div id="watermark-container" class="mt-4"></div>
          </div>
    
          <button
            id="check-membership"
            on:click={checkFastlaneMembership}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
            Check Membership
          </button>
        {#if isMembershipChecked}
          {#if renderFastlaneMemberExperience && shippingAddress}
            <div class="mt-6 p-4 border rounded-lg bg-green-50 text-green-700">
              <h2 class="text-xl font-semibold mb-2">Shipping Address</h2>
              <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
              <p>{shippingAddress.streetAddress}, {shippingAddress.extendedAddress}</p>
              <p>{shippingAddress.locality}, {shippingAddress.region} {shippingAddress.postalCode}</p>
              <p>{shippingAddress.countryCodeAlpha2}</p>
              <div id="watermark-container" class="mt-4"></div>
              <button id="your-change-address-button" class="mt-4 py-2 px-4 bg-gray-200 rounded-md">Change Address</button>
            </div>
            <div id="payment-container" class="mt-6 p-4 border rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-md border-gray-300"></div>
            <button 
          class="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition" 
          on:click={handleSubmit}>
          Submit Order
        </button>
          {:else}
          <div class="mt-6 p-4 border rounded-lg bg-yellow-50 text-yellow-700">
            <h2 class="text-xl font-semibold mb-2">Enter Your Shipping Address</h2>
            <form id="shipping-address-form">
              <label for="company" class="block text-sm font-medium text-gray-700">Company:</label>
              <input
                type="text"
                id="company"
                bind:value={shippingAddress.company}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Company (optional)"
              />
              <label for="streetAddress" class="block text-sm font-medium text-gray-700">Street Address:</label>
              <input
                type="text"
                id="streetAddress"
                bind:value={shippingAddress.streetAddress}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Street Address"
                required
              />
              <label for="extendedAddress" class="block text-sm font-medium text-gray-700">Extended Address:</label>
              <input
                type="text"
                id="extendedAddress"
                bind:value={shippingAddress.extendedAddress}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Extended Address (optional)"
              />
              <label for="locality" class="block text-sm font-medium text-gray-700">City:</label>
              <input
                type="text"
                id="locality"
                bind:value={shippingAddress.locality}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="City"
                required
              />
              <label for="region" class="block text-sm font-medium text-gray-700">State/Region:</label>
              <input
                type="text"
                id="region"
                bind:value={shippingAddress.region}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="State/Region"
                required
              />
              <label for="postalCode" class="block text-sm font-medium text-gray-700">Postal Code:</label>
              <input
                type="text"
                id="postalCode"
                bind:value={shippingAddress.postalCode}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Postal Code"
                required
              />
              <label for="countryCodeAlpha2" class="block text-sm font-medium text-gray-700">Country Code:</label>
              <input
                type="text"
                id="countryCodeAlpha2"
                bind:value={shippingAddress.countryCodeAlpha2}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Country Code (e.g., US)"
                required
              />
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number:</label>
              <input
                type="tel"
                id="phoneNumber"
                bind:value={shippingAddress.phoneNumber}
                class="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="Phone Number"
                required
              />
              <button type="submit" class="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                Save Address
              </button>
            </form>
            <div id="payment-container" class="mt-6 p-4 border rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-md border-gray-300"></div>
          </div>
            <button 
          class="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition" 
          on:click={handleSubmit}>
          Submit Order
        </button>
        <div id="watermark-container" class="mt-4"></div>
          {/if}
        {/if}
        </div>
    
        <div id="payment-container" class="mt-6"></div>
        <div id="watermark-container" class="mt-4"></div>
    
        {#if showErrorMessage}
          <div class="mt-6 p-4 border rounded-lg bg-red-50 text-red-700" in:fade={{ duration: 500 }} out:fade={{ duration: 1000 }}>
            <p>{errorMessage}</p>
          </div>
        {/if}
      {/if}
      <footer class="mt-8 text-center">
        <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
      </footer>
    </div>
  </main>
  
  <style>
    main {
      font-family: 'Inter', sans-serif;
    }
  </style>