document.addEventListener("DOMContentLoaded", () => {

  // Fill time dropdown
  const bookingTime = document.getElementById("booking-time");
  const times = ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"];
  times.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    bookingTime.appendChild(option);
  });

  const payBtn = document.getElementById("stripe-button");
  if (!payBtn) return;

  const stripe = Stripe("pk_live_51Nwbk6BdpYMd8RZYKtCvz8VPQjFQCZbmcJ3y3tj2bNxyAd4xv9Ey3fnREYyYeTbR0i26CdD3W5VUiYdJizmLP4J000bNKolpY3");

  function calculateTotal() {
    let total = 0;
    document.querySelectorAll(".service:checked").forEach(cb => total += parseInt(cb.dataset.price));
    document.querySelectorAll(".convenience:checked").forEach(cb => total += parseInt(cb.dataset.price));
    const travel = document.getElementById("travelDistance");
    if (travel && travel.selectedOptions.length > 0) total += parseInt(travel.selectedOptions[0].dataset.price || 0);

    document.getElementById("total").textContent = total;
    document.getElementById("deposit").textContent = Math.ceil(total * 0.2);
    return total;
  }

  document.querySelectorAll(".service, .convenience, #travelDistance")
    .forEach(el => el.addEventListener("change", calculateTotal));

  payBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const total = calculateTotal();
    const deposit = Math.ceil(total * 0.2);
    const amountInCents = deposit * 100;

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    if (!name || !email) { alert("Enter name and email"); return; }

    const services = [
      ...document.querySelectorAll(".service:checked"),
      ...document.querySelectorAll(".convenience:checked")
    ].map(cb => cb.parentElement.textContent.trim());

    const travelOption = document.getElementById("travelDistance").selectedOptions[0];
    if (travelOption) services.push(travelOption.textContent.trim());

    try {
      console.log("Sending request to backend...");
      const response = await fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInCents,
          customerName: name,
          customerEmail: email,
          services: services
        })
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.id) {
        stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("Payment session failed: " + (data.error || "Unknown error"));
      }

    } catch (err) {
      console.error(err);
      alert("Payment error: " + err.message);
    }
  });

  calculateTotal();

});