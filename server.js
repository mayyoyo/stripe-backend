require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORRECT
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/create-checkout-session", async (req, res) => {
  const { name, email, amount } = req.body;

  if (!name || !email || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Mobile Notary – 20% Deposit",
              description: `Deposit for ${name}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:4242/success.html",
      cancel_url: "http://localhost:4242/booking.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe session failed" });
  }
});

app.listen(4242, () => {
  console.log("✅ Server running on http://localhost:4242");
});






