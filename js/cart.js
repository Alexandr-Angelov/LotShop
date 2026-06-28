let cart = JSON.parse(localStorage.getItem('lotshop_cart')) || {};

const currencyNames = {
    "USD": "Сувенірні Долари ($)",
    "EUR": "Сувенірні Євро (€)",
    "KZT": "Сувенірні Тенге (₸)",
    "INR": "Сувенірні Рупії (₹)",
    "UAH_FAKE": "Сувенірні Гривні (₴)"
};

const currencyImages = {
    "USD": "../images/MoneyShop/usd.png",
    "EUR": "../images/MoneyShop/eur.png",
    "KZT": "../images/MoneyShop/kzt.png",
    "INR": "../images/MoneyShop/inr.png",
    "UAH_FAKE": "../images/MoneyShop/uah.png"
};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const listContainer = document.getElementById('cartItemsList');
    const totalSumContainer = document.getElementById('cartPageSum');
    const clearBtn = document.getElementById('clearCartBtn');
    
    if (!listContainer || !totalSumContainer) return;

    fetch('../db/sportshop_db.json')
        .then(response => response.json())
        .then(products => {
            listContainer.innerHTML = '';
            let totalSum = 0;
            let hasItems = false;

            for (let id in cart) {
                const quantity = cart[id];

                if (id.startsWith('money_')) {
                    hasItems = true;
                    const parts = id.split('_');
                    const code = parts[1];
                    const amount = parts[2];
                    const itemPriceGrivnas = parseInt(parts[3]);
                    const itemSum = itemPriceGrivnas * quantity;
                    totalSum += itemSum;

                    const itemRow = document.createElement('div');
                    itemRow.className = 'cart-item-row';
                    itemRow.innerHTML = `
                        <img src="${currencyImages[code] || '../images/MoneyShop/usd.png'}" class="cart-item-img" style="width:70px; height:70px; object-fit:contain; border-radius:10px;">
                        <div class="cart-item-info">
                            <h3 class="cart-item-name">${currencyNames[code]} (${amount} од.)</h3>
                            <span class="cart-item-price-each">${itemPriceGrivnas} ₴ / пачка</span>
                        </div>
                        <div class="cart-item-controls">
                            <button class="cart-qty-btn" onclick="updateQty('${id}', -1)">-</button>
                            <span class="cart-qty-val">${quantity}</span>
                            <button class="cart-qty-btn" onclick="updateQty('${id}', 1)">+</button>
                        </div>
                        <div class="cart-item-subtotal">${itemSum} ₴</div>
                    `;
                    listContainer.appendChild(itemRow);
                } 
                else {
                    const product = products.find(p => p.id == id);
                    if (product) {
                        hasItems = true;
                        const itemSum = product.price * quantity;
                        totalSum += itemSum;

                        const itemRow = document.createElement('div');
                        itemRow.className = 'cart-item-row';
                        itemRow.innerHTML = `
                            <img src="${product.image}" alt="${product.name}" class="cart-item-img">
                            <div class="cart-item-info">
                                <h3 class="cart-item-name">${product.name}</h3>
                                <span class="cart-item-price-each">${product.price} ₴ / шт.</span>
                            </div>
                            <div class="cart-item-controls">
                                <button class="cart-qty-btn" onclick="updateQty(${product.id}, -1)">-</button>
                                <span class="cart-qty-val">${quantity}</span>
                                <button class="cart-qty-btn" onclick="updateQty(${product.id}, 1)">+</button>
                            </div>
                            <div class="cart-item-subtotal">${itemSum} ₴</div>
                        `;
                        listContainer.appendChild(itemRow);
                    }
                }
            }

            if (!hasItems) {
                listContainer.innerHTML = '<p class="cart-empty-text">Кошик порожній... Поверніться до магазину, щоб щось обрати!</p>';
                if (clearBtn) clearBtn.style.display = 'none';
            } else {
                if (clearBtn) clearBtn.style.display = 'block';
            }

            totalSumContainer.textContent = `${totalSum} ₴`;
        })
        .catch(() => {
            listContainer.innerHTML = '<p class="cart-empty-text">Помилка завантаження товарів...</p>';
        });
}

function updateQty(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    localStorage.setItem('lotshop_cart', JSON.stringify(cart));
    renderCart();
}

function clearCart() {
    cart = {};
    localStorage.setItem('lotshop_cart', JSON.stringify(cart));
    renderCart();
}

function handleCheckout(event) {
    event.preventDefault();
    if (Object.keys(cart).length === 0) {
        alert('Ваш кошик порожній!');
        return;
    }
    alert('На жаль, в нас немає товарів');
}