const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Your test secret key

// Update CORS to match your frontend URL (Live Server or localhost)
app.use(cors({
  origin: [
    "http://127.0.0.1:5500", // if using Live Server
    "http://localhost:5500",
    "http://localhost:3000" // optional if you serve frontend from Express
  ]
}));

app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const { amount, customerName, customerEmail, services } = req.body;

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
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://127.0.0.1:5500/success.html",
      cancel_url: "http://127.0.0.1:5500/booking.html",
    });

    res.json({ id: session.id });

  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));