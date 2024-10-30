<script>
  import Card from '../components/Card.svelte';
</script>

<!-- Main landing page content -->
<main class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 text-gray-800">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-blue-600">PayPal/Braintree/Venmo Integrations Repository</h1>
      <p class="mt-4 text-lg text-gray-600">Explore and integrate various payment solutions with ease.</p>
    </header>
  
    <section class="w-full max-w-4xl mx-auto mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Braintree Integrations</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card title="PayPal Button via Braintree" subtitle="Integrate PayPal for seamless payment processing and transaction management." route="paypal"/>
        <Card title="Braintree Drop-In UI" subtitle="Utilize Braintree for a robust payment gateway with multiple payment options." route="braintree"/> 
        <Card title="Venmo Button" subtitle="Add Venmo to your payment options for easy peer-to-peer transactions." route="venmo"/>
        <Card title="Hosted Fields" subtitle="Hosted Fields ensures PCI compliance by securely handling payment fields via iframe." route="hosted"/>
        <Card title="Hosted Fields (MAID INR currency)" subtitle="Hosted Fields with a currency apart from USD." route="hosted-inr"/>
        <Card title="Fastlane via Braintree" subtitle="Fastlane simplifies and accelerates mobile checkout." route="fastlane"/>  
        <Card title="Google Pay Button via Braintree" subtitle="Seamless payments with Google Pay using Braintree's secure integration." route="google-pay"/>  
      </div>
    </section>
    
    <section class="w-full max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">PayPal Integrations</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Add PayPal integration cards here -->
        <Card title="PayPal Checkout" subtitle="Integrate PayPal Checkout for easy and secure payments." route="paypal-checkout/standard"/>
        <Card title="PayPal Subscription" subtitle="Manage PayPal subscriptions and recurring payments." route="paypal-subscription"/>
        <Card title="PayPal Save Payment Methods" subtitle="Save Payment Methods for faster checkout experiences" route="paypal-save"/>
        <!-- Add more PayPal cards as needed -->
      </div>
    </section>
  
    <footer class="mt-12 text-center">
      <p class="text-gray-600">© 2024 Integrations Repository. All rights reserved.</p>
    </footer>
  </main>