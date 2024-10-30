<script>

    import { tokenStore } from '../../../api/store'
    let merchantAccountId = ''; // Bound to the input field
    let token = ''; // To store the generated client token
    let error = ''; // To store error messages
    let isLoading = false; // To track loading state
  
    // Function to handle form submission
    async function generateToken() {
      isLoading = true;
      error = ''; // Clear any previous errors
      token = ''; // Clear any previous token
      try {
        const response = await fetch('/api/maid-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ merchantAccountId })
        });
  
        const result = await response.json();
  
        if (result.success) {
          token = result.token;
          tokenStore.set(result.token); // Set the token in the store
        } else {
          error = result.error || 'Failed to generate client token';
        }
      } catch (err) {
        error = 'An unexpected error occurred. Please try again.';
      } finally {
        isLoading = false;
      }
    }
  </script>
  
  <!-- UI Structure with Tailwind CSS -->
  <div class="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
    <h1 class="text-2xl font-bold text-center mb-4">Generate Client Token with a MAID</h1>
  
    <!-- Input Field for Merchant Account ID -->
    <div class="mb-4">
      <label for="merchantAccountId" class="block text-sm font-medium text-gray-700">Merchant Account ID</label>
      <input
        id="merchantAccountId"
        type="text"
        bind:value={merchantAccountId}
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder="Enter Merchant Account ID"
      />
    </div>
  
    <!-- Generate Client Token Button -->
    <button
      on:click={generateToken}
      class="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      disabled={isLoading}
    >
      {isLoading ? 'Generating...' : 'Generate Client Token'}
    </button>
  
    <!-- Display Client Token or Error Message -->
    {#if token}
      <div class="mt-6">
        <h2 class="text-lg font-medium text-gray-900">Client Token</h2>
        <p class="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md text-sm break-all">
          {token}
        </p>
      </div>
    {/if}
  
    {#if error}
      <div class="mt-4 text-red-600 text-sm">
        {error}
      </div>
    {/if}
  </div>
  