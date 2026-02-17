/* ================= LANGUAGE ================= */
const langSelect = document.getElementById("langSelect");
let currentLang = localStorage.getItem("lang") || "en";

document.documentElement.lang = currentLang;
applyLanguage(currentLang);

if (langSelect) {
  langSelect.value = currentLang;
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    localStorage.setItem("lang", currentLang);
    document.documentElement.lang = currentLang;
    applyLanguage(currentLang);
  });
}

function applyLanguage(lang) {
  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.dataset[lang] || el.textContent;
  });
}

/* ================= CART ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, category) {
  const item = cart.find((i) => i.name === name);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, qty: 1, category });
  }
  saveCart();
}

function removeFromCart(name) {
  cart = cart.filter((i) => i.name !== name);
  saveCart();
}

function changeQty(name, delta) {
  const item = cart.find((i) => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) removeFromCart(name);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  renderOrderPage();
}

function renderCart() {
  const items = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");
  if (!items || !total) return;

  let sum = 0;
  items.innerHTML = "";

  cart.forEach((i) => {
    sum += i.price * i.qty;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <span>${i.qty} × ${i.name}</span>
      <div class="cart-buttons">
        <button onclick="changeQty('${i.name}',1)">+</button>
        <button onclick="changeQty('${i.name}',-1)">-</button>
        <button onclick="removeFromCart('${i.name}')">x</button>
      </div>
    `;
    items.appendChild(div);
  });

  total.textContent = sum.toFixed(2);
}

/* ================= ORDER PAGE ================= */
function renderOrderPage() {
  const items = document.getElementById("cart-items");
  const total = document.getElementById("orderTotal");
  if (!items || !total) return;

  let sum = 0;
  items.innerHTML = "";

  cart.forEach((i) => {
    const sub = i.price * i.qty;
    sum += sub;
    const div = document.createElement("div");
    div.classList.add("order-item");
    div.innerHTML = `
      <span>${i.qty} × ${i.name} = $${sub.toFixed(2)}</span>
      <div class="cart-buttons">
        <button onclick="changeQty('${i.name}',1)">+</button>
        <button onclick="changeQty('${i.name}',-1)">-</button>
        <button onclick="removeFromCart('${i.name}')">x</button>
      </div>
    `;
    items.appendChild(div);
  });

  total.textContent = sum.toFixed(2);
}

/* ================= PAYMENT FORM ================= */
const paymentForm = document.getElementById("paymentForm");
if (paymentForm) {
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cart.length) {
      alert(currentLang === "en" ? "Cart is empty!" : "ጋርታ ባዶ ነው!");
      return;
    }

    // Front-end alert (replace with backend integration)
    alert(currentLang === "en" ? "✅ Order placed!" : "✅ ትዕዛዝ ተላከ!");

    // Reset cart & form
    localStorage.removeItem("cart");
    cart = [];
    saveCart();
    paymentForm.reset();

    // Redirect to homepage
    window.location.href = "index.html";
  });
}

/* ================= MENU FILTER ================= */
function filterMenu(type) {
  document.querySelectorAll(".card").forEach((card) => {
    card.style.display =
      type === "all" || card.dataset.category === type ? "block" : "none";
  });
}

/* ================= HAMBURGER MENU ================= */
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}

/* ================= INIT ================= */
renderCart();
renderOrderPage();
