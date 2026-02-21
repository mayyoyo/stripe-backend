// script.js
document.addEventListener("DOMContentLoaded", () => {

  // --- Fill Time Dropdown ---
  const bookingTime = document.getElementById("booking-time");
  const times = [
    "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
    "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"
  ];
  times.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    bookingTime.appendChild(option);
  });

  // --- Stripe Payment ---
  const payBtn = document.getElementById("stripe-button");
  if (!payBtn) return;

  // Use your LIVE Stripe public key
  const stripe = Stripe("pk_live_51Nwbk6BdpYMd8RZYKtCvz8VPQjFQCZbmcJ3y3tj2bNxyAd4xv9Ey3fnREYyYeTbR0i26CdD3W5VUiYdJizmLP4J000bNKolpY3");

  // Calculate total & deposit
  function calculateTotal() {
    let total = 0;

    document.querySelectorAll(".service:checked").forEach(cb => total += parseInt(cb.dataset.price));
    document.querySelectorAll(".convenience:checked").forEach(cb => total += parseInt(cb.dataset.price));

    const travel = document.getElementById("travelDistance");
    if (travel) total += parseInt(travel.selectedOptions[0].dataset.price || 0);

    document.getElementById("total").textContent = total;
    document.getElementById("deposit").textContent = Math.ceil(total * 0.2);

    return total;
  }

  document.querySelectorAll(".service, .convenience, #travelDistance")
    .forEach(el => el.addEventListener("change", calculateTotal));

  // Payment button click
  payBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const total = calculateTotal();
    const deposit = Math.ceil(total * 0.2);
    const amountInCents = deposit * 100;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("booking-date").value;
    const time = document.getElementById("booking-time").value;

    if (!name || !email || !date || !time) {
      alert("Please fill in Name, Email, Date, and Time.");
      return;
    }

    // Gather services and fees
    const services = [
      ...document.querySelectorAll(".service:checked"),
      ...document.querySelectorAll(".convenience:checked")
    ].map(cb => cb.nextSibling.textContent.trim());

    const travelOption = document.getElementById("travelDistance").selectedOptions[0];
    if (travelOption) services.push(travelOption.textContent.trim());

    try {
      const response = await fetch("https://stripe-backend-5-qp5u.onrender.com/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInCents,
          customerName: name,
          customerEmail: email,
          services: services,
          bookingDate: date,
          bookingTime: time
        })
      });

      const data = await response.json();

      if (data.id) {
        // Redirect to Stripe checkout
        stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("Payment session failed.");
      }

    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment error. Please try again.");
    }
  });

  calculateTotal();
});
// 


// Close menu when clicking a link (mobile UX fix)
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});