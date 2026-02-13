// ----------------- IMPORTS -----------------
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------- MIDDLEWARE -----------------
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve HTML/CSS/JS

// ----------------- STRIPE CHECKOUT -----------------
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { name, email, date, time, total } = req.body;

    if (!total || total <= 0) return res.status(400).json({ error: "Invalid total amount" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking: ${name} - ${date} at ${time}`,
            },
            unit_amount: total, // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://safeandsecuremobilenotary.com/success.html",
      cancel_url: "https://safeandsecuremobilenotary.com/booking.html",
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
