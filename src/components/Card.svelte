<script>
export let title;
export let subtitle;
export let route;

function redirectToRoute() {
    window.location.href = `${location.href}${route}`
}
</script>

<div class="bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-xl font-semibold text-blue-500 mb-4">{title}</h2>
    <p class="text-gray-700 mb-4">{subtitle}</p>
    <button 
  on:click={redirectToRoute}
  class="mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105">
  Learn More
</button>
  </div>