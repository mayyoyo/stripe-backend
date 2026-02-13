// ----------------- TIME DROPDOWN -----------------
const timeSelect = document.getElementById("booking-time");

function populateTimes() {
  timeSelect.innerHTML = '<option value="">-- Select Time --</option>';
  
  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      let h = hour;
      let ampm = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;

      const m = min.toString().padStart(2, "0");
      const label = `${h}:${m} ${ampm}`;

      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      timeSelect.appendChild(option);
    }
  }
}

populateTimes();

// ----------------- TOTAL & DEPOSIT CALC -----------------
const services = document.querySelectorAll(".service");
const convenience = document.querySelectorAll(".convenience");
const travel = document.getElementById("travelDistance");

const totalEl = document.getElementById("total");
const depositEl = document.getElementById("deposit");

function calculateTotal() {
  let total = 0;

  services.forEach(cb => cb.checked && (total += Number(cb.dataset.price)));
  convenience.forEach(cb => cb.checked && (total += Number(cb.dataset.price)));
  total += Number(travel.selectedOptions[0].dataset.price);

  totalEl.textContent = total.toFixed(2);
  depositEl.textContent = (total * 0.2).toFixed(2);
}

// Update total whenever user changes any input
document.querySelectorAll("input, select").forEach(el =>
  el.addEventListener("change", calculateTotal)
);

// Initial calculation
calculateTotal();

// ----------------- STRIPE PAYMENT -----------------
const stripe = Stripe("pk_live_xxxxx"); // <-- Replace with your real Stripe publishable key

document.getElementById("stripe-button").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const date = document.getElementById("booking-date").value;
  const time = timeSelect.value;
  const total = Number(totalEl.textContent);

  if (!name || !email || !date || !time || total <= 0) {
    alert("Please complete all fields and select services.");
    return;
  }

  const deposit = Math.round(total * 0.2 * 100); // Stripe uses cents

  try {
    const res = await fetch("https://stripe-backend-1-lykz.onrender.com/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total: deposit, name, email, date, time })
    });

    const session = await res.json();
    stripe.redirectToCheckout({ sessionId: session.id });

  } catch (err) {
    console.error(err);
    alert("Payment failed. Check console for details.");
  }
});
