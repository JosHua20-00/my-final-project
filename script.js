let cart = JSON.parse(localStorage.getItem("cart")) || [];
let loggedInUser = localStorage.getItem("loggedInUser") ? JSON.parse(localStorage.getItem("loggedInUser")) : null;
let deliveryAddress = localStorage.getItem("deliveryAddress") || "";

function updateAuthLinks() {
    const navLinks = document.getElementById("nav-links");
    if (navLinks) {
        Array.from(navLinks.children).forEach(link => {
            if (link.textContent === "Register" || link.textContent === "Login" || link.textContent === "Logout" || link.textContent.startsWith("My Account")) {
                link.remove();
            }
        });

        if (loggedInUser) {
            const myAccountLink = document.createElement("a");
            myAccountLink.href = "#"; // You can create a dedicated account page later
            myAccountLink.textContent = `My Account (${loggedInUser.name})`;
            navLinks.insertBefore(myAccountLink, navLinks.querySelector('button'));

            const logoutLink = document.createElement("a");
            logoutLink.href = "#";
            logoutLink.textContent = "Logout";
            logoutLink.onclick = logoutUser;
            navLinks.insertBefore(logoutLink, navLinks.querySelector('button'));
        } else {
            const registerLink = document.createElement("a");
            registerLink.href = "register.html";
            registerLink.textContent = "Register";
            navLinks.insertBefore(registerLink, navLinks.querySelector('button'));

            const loginLink = document.createElement("a");
            loginLink.href = "login.html";
            loginLink.textContent = "Login";
            navLinks.insertBefore(loginLink, navLinks.querySelector('button'));
        }
    }
}

function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(user => user.email === email)) {
        showToast("Email already registered!");
        return;
    }
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify({ name, email }));
    loggedInUser = { name, email };
    showToast("Registration successful! You are now logged in.");
    updateAuthLinks();
    window.location.href = "index.html";
}

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify({ name: user.name, email: user.email }));
        loggedInUser = { name: user.name, email: user.email };
        showToast(`Login successful, ${user.name}!`);
        updateAuthLinks();
        window.location.href = "index.html";
    } else {
        showToast("Invalid email or password!");
    }
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    loggedInUser = null;
    showToast("Logged out successfully.");
    updateAuthLinks();
    window.location.href = "index.html";
}

function addToCart(productName, price, quantity = 1) {
    quantity = parseInt(quantity);
    price = parseFloat(price);
    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.qty += quantity;
    } else {
        cart.push({ name: productName, price: price, qty: quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${productName} added to cart!`);
    updateCartCount();
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById("cart-list");
    const cartTotalElement = document.getElementById("cart-total");
    const deliveryAddressTextarea = document.getElementById("deliveryAddress");

    if (!cartList || !cartTotalElement || !deliveryAddressTextarea) return;

    cartList.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - Qty: `;

        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "1";
        qtyInput.value = item.qty;
        qtyInput.addEventListener("change", (event) => {
            updateCartItemQty(index, parseInt(event.target.value));
        });
        li.appendChild(qtyInput);

        li.innerHTML += ` x K${item.price.toFixed(2)} = K${(item.qty * item.price).toFixed(2)} `;
        li.innerHTML += ` <button onclick="removeFromCart(${index})">Remove</button>`;
        cartList.appendChild(li);
        total += item.qty * item.price;
    });

    cartTotalElement.textContent = total.toFixed(2);
    deliveryAddressTextarea.value = deliveryAddress; // Load saved address
    deliveryAddressTextarea.addEventListener("input", saveDeliveryAddress);
}

function saveDeliveryAddress(event) {
    deliveryAddress = event.target.value;
    localStorage.setItem("deliveryAddress", deliveryAddress);
}

function updateCartItemQty(index, newQty) {
    if (newQty > 0) {
        cart[index].qty = newQty;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    } else {
        removeFromCart(index);
    }
    updateCartCount();
}

function clearCart() {
    cart = [];
    localStorage.removeItem("cart");
    renderCart();
    updateCartCount();
    showToast("Cart cleared!");
}

function filterCategory(cat) {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach(card => {
        const match = cat === "all" || card.dataset.category === cat;
        card.style.display = match ? "block" : "none";
    });
}

function autoSaveForm() {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    if (name && email) {
        name.value = localStorage.getItem("contactName") || "";
        email.value = localStorage.getItem("contactEmail") || "";

        name.addEventListener("input", () => {
            localStorage.setItem("contactName", name.value);
        });
        email.addEventListener("input", () => {
            localStorage.setItem("contactEmail", email.value);
        });
    }
}

function updateCartCount() {
    const cartCount = document.querySelector("#cart-count");
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalItems;
    }
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function submitForm(event) {
    event.preventDefault();
    const name = event.target[0].value;
    const email = event.target[1].value;
    showToast(`Thanks ${name}, we received your message!`);
    event.target.reset();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function loadPreferences() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
    updateCartCount();
    renderCart();
    updateAuthLinks();
}

function toggleMenu() {
    document.getElementById("nav-links").classList.toggle("active");
}

function filterProducts() {
    const input = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = title.includes(input) ? "block" : "none";
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function checkout() {
    console.log("Checkout button clicked");
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    const address = document.getElementById("deliveryAddress").value.trim();
    if (!address) {
        showToast("Please enter your delivery address.");
        return;
    }
    localStorage.setItem("deliveryAddress", address);
    window.location.href = "checkout.html";
    console.log("Navigating to checkout.html");
}

document.addEventListener("DOMContentLoaded", () => {
    loadPreferences();
    autoSaveForm();
});
// Get the button
let backToTopBtn = document.getElementById("backToTopBtn");

// When the user scrolls down 1000px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  // For Safari
  document.body.scrollTop = 0;
  // For Chrome, Firefox, IE and Opera
  document.documentElement.scrollTop = 0;
}
