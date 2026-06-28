let cart = JSON.parse(localStorage.getItem('lotshop_cart')) || {};
let exchangeRates = { 
    "USD": 41.20, "EUR": 44.50, "KZT": 0.088, "INR": 0.49, 
    "FAKE_USD": 20.00, "FAKE_EUR": 22.00, "FAKE_KZT": 0.044, "FAKE_INR": 0.25, "FAKE_UAH": 1.0 
};
let moneyProducts = [];
let currentCategory = 'real';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    loadRatesAndProducts();
    
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = '../html/cart.html';
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderMoneyCards();
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderMoneyCards();
        });
    }
});

function loadRatesAndProducts() {
    fetch('https://open.er-api.com/v6/latest/UAH')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates) {
                exchangeRates["USD"] = 1 / data.rates["USD"];
                exchangeRates["EUR"] = 1 / data.rates["EUR"];
                exchangeRates["KZT"] = 1 / data.rates["KZT"];
                exchangeRates["INR"] = 1 / data.rates["INR"];
                exchangeRates["FAKE_USD"] = (1 / data.rates["USD"]) * 0.5;
                exchangeRates["FAKE_EUR"] = (1 / data.rates["EUR"]) * 0.5;
                exchangeRates["FAKE_KZT"] = (1 / data.rates["KZT"]) * 0.5;
                exchangeRates["FAKE_INR"] = (1 / data.rates["INR"]) * 0.5;
            }
            return fetch('../db/moneyshop_db.json');
        })
        .then(res => res.json())
        .then(products => {
            moneyProducts = products;
            renderMoneyCards();
            updateCartUI();
        })
        .catch(() => {
            fetch('../db/moneyshop_db.json')
                .then(res => res.json())
                .then(products => {
                    moneyProducts = products;
                    renderMoneyCards();
                    updateCartUI();
                });
        });
}

function filterMoneyCategory(category, button) {
    currentCategory = category;
    document.querySelectorAll('nav .nav-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderMoneyCards();
}

function renderMoneyCards() {
    const container = document.getElementById('moneyExchangeContainer');
    if (!container) return;
    container.innerHTML = '';

    const filtered = moneyProducts.filter(product => {
        const matchesCategory = product.type === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#fff; font-weight:900; font-size:1.2rem;">Нічого не знайдено...</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('section');
        card.className = 'product-card money-card';

        const currentRate = exchangeRates[product.code];
        const rateText = product.code === "FAKE_UAH" ? "Курс: 1 до 1" : `Курс: 1 од. ≈ ${currentRate.toFixed(2)} ₴`;
        const displayLabel = product.code.replace('FAKE_', '');
        
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </div>
            <div class="product-info">
                <h2 class="product-title">${product.name}</h2>
                <p class="product-text">${rateText}<br>Введіть необхідну кількість для покупки в кошик.</p>
                <div class="money-input-row">
                    <input type="number" id="input-${product.code}" min="1" value="10" oninput="calculateLivePrice('${product.code}')">
                    <span class="currency-label-inside">${displayLabel === 'UAH' ? '₴' : displayLabel}</span>
                </div>
                <div class="product-footer">
                    <span class="product-price" id="price-${product.code}">0 ₴</span>
                    <div class="controls-wrapper">
                        <button class="buy-btn" onclick="addMoneyToCart('${product.code}')">Купити</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
        calculateLivePrice(product.code);
    });
}

function calculateLivePrice(code) {
    const input = document.getElementById(`input-${code}`);
    const priceSpan = document.getElementById(`price-${code}`);
    if (!input || !priceSpan) return;

    let amount = parseFloat(input.value) || 0;
    if (amount < 0) amount = 0;

    const totalPrice = Math.round(amount * exchangeRates[code]);
    priceSpan.textContent = `${totalPrice} ₴`;
}

function addMoneyToCart(code) {
    const input = document.getElementById(`input-${code}`);
    if (!input) return;

    let amount = parseInt(input.value) || 0;
    if (amount <= 0) {
        alert('Будь ласка, введіть коректну кількість!');
        return;
    }

    const singlePackPrice = Math.round(amount * exchangeRates[code]);
    const cartItemId = `money_${code}_${amount}_${singlePackPrice}`;
    
    cart[cartItemId] = (cart[cartItemId] || 0) + 1;
    localStorage.setItem('lotshop_cart', JSON.stringify(cart));
    updateCartUI();
    alert('Додано до кошика!');
}

function updateCartUI() {
    const countElem = document.getElementById('cartCount');
    const sumElem = document.getElementById('cartSum');
    if (!countElem || !sumElem) return;

    let totalCount = 0;
    let totalSum = 0;

    for (let id in cart) {
        if (id.startsWith('money_')) {
            const parts = id.split('_');
            const quantity = cart[id];
            const price = parseInt(parts[parts.length - 1]);
            totalCount += quantity;
            totalSum += price * quantity;
        }
    }

    fetch('../db/sportshop_db.json')
        .then(res => res.json())
        .then(sportProducts => {
            for (let id in cart) {
                const product = sportProducts.find(p => p.id == id);
                if (product) {
                    totalCount += cart[id];
                    totalSum += product.price * cart[id];
                }
            }
            countElem.textContent = `${totalCount} шт.`;
            sumElem.textContent = `${totalSum} ₴`;
        })
        .catch(() => {
            countElem.textContent = `${totalCount} шт.`;
            sumElem.textContent = `${totalSum} ₴`;
        });
}