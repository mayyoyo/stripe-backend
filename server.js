// server.js
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();

// Stripe instance
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Make sure this is your LIVE key in Render

// CORS: allow your live frontend domain
app.use(cors({
  origin: [
    "https://safeandsecuremobilenotary.com", // replace with your frontend URL
  ]
}));

app.use(express.json());

// Endpoint to create Stripe checkout session
app.post("/create-checkout-session", async (req, res) => {
  const { amount, customerName, customerEmail, services } = req.body;

  if (!amount || !customerName || !customerEmail) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Notary Service Deposit (20%)",
              description: `Client: ${customerName}\nServices: ${services.join(", ")}`
            },
            unit_amount: amount,
          },
          quantity: 1,
        }
      ],
      mode: "payment",
      success_url: "https://safeandsecuremobilenotary.com/success.html",
      cancel_url: "https://safeandsecuremobilenotary.com/booking.html",
    });

    res.json({ id: session.id });

  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: "Payment session failed" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));