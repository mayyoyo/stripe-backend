// public/js/script.js

// Only run this code on booking page
if (document.getElementById("stripe-button")) {

  // Initialize Stripe with your PUBLIC key
  const stripe = Stripe("pk_live_51Nwbk6BdpYMd8RZYKtCvz8VPQjFQCZbmcJ3y3tj2bNxyAd4xv9Ey3fnREYyYeTbR0i26CdD3W5VUiYdJizmLP4J000bNKolpY3"); // ⚠️ Replace with your live public key

  const payBtn = document.getElementById("stripe-button");

  // Example: calculate total (if you have services or options)
  function calculateTotal() {
    let total = 0;

    // Example: sum up selected services (if you have checkboxes)
    const serviceCheckboxes = document.querySelectorAll(".service-checkbox");
    serviceCheckboxes.forEach(cb => {
      if (cb.checked) {
        total += parseInt(cb.dataset.amount); // amount in cents
      }
    });

    return total;
  }

  payBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const amount = calculateTotal() || 1000; // default 1000 cents ($10) if nothing selected
    const customerName = document.getElementById("customer-name").value || "John Doe";
    const customerEmail = document.getElementById("customer-email").value || "john@example.com";

    try {
      const response = await fetch("https://safe-notary-backend.onrender.com/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount,
          customerName: customerName,
          customerEmail: customerEmail
        })
      });

      const data = await response.json();

      if (data.id) {
        // Redirect to Stripe Checkout
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("Failed to create Stripe session.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Check console for details.");
    }
  });
}