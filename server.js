app.post("/create-checkout-session", async (req, res) => {
  try {
    const { total, name, email, date, time } = req.body;

    if (!total || total <= 0) {
      return res.status(400).json({ error: "Invalid total amount." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking for ${name} - ${date} at ${time}`,
            },
            unit_amount: total, // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://safeandsecuremobilenotary.com/success.html?name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&amount=${total}`,
      cancel_url: "https://safeandsecuremobilenotary.com/booking.html",
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed." });
  }
});
