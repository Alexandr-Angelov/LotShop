let cart = JSON.parse(localStorage.getItem('lotshop_cart')) || {};
let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    loadProducts();
    
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
            renderFilteredProducts();
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderFilteredProducts();
        });
    }
});

function assignCategory(id) {
    if ([1, 2, 3, 4, 5].includes(id)) return 'мячі';
    if ([6, 7, 8].includes(id)) return 'ракетки';
    if ([14, 15, 17, 20].includes(id)) return 'важка атлетика';
    if ([9, 12, 13].includes(id)) return 'бокс';
    return 'інше';
}

function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    fetch('../db/sportshop_db.json')
        .then(response => response.json())
        .then(products => {
            allProducts = products.map(p => ({ ...p, category: assignCategory(p.id) }));
            renderFilteredProducts();
        })
        .catch(() => {
            container.innerHTML = '<p class="error-msg">Помилка завантаження товарів...</p>';
        });
}

function renderFilteredProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = '';

    const filtered = allProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) || product.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p class="error-msg">Товарів не знайдено...</p>';
        return;
    }

    filtered.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function filterByCategory(category) {
    currentCategory = category;
    renderFilteredProducts();
}

function createProductCard(product) {
    const card = document.createElement('section');
    card.className = 'product-card';
    const quantity = cart[product.id] || 0;
    
    card.innerHTML = `
        <div class="product-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="product-img">
        </div>
        <div class="product-info">
            <h2 class="product-title">${product.name}</h2>
            <p class="product-text">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">${product.price} ₴</span>
                <div class="controls-wrapper ${quantity > 0 ? 'has-items' : ''}">
                    <button class="buy-btn" onclick="addToCart(${product.id})">Купити</button>
                    <div class="quantity-controls">
                        <button class="control-btn minus" onclick="changeQuantity(${product.id}, -1)">-</button>
                        <span class="quantity-value">${quantity}</span>
                        <button class="control-btn plus" onclick="changeQuantity(${product.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return card;
}

function addToCart(id) {
    cart[id] = 1;
    saveCart();
    renderFilteredProducts();
}

function changeQuantity(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    saveCart();
    renderFilteredProducts();
}

function saveCart() {
    localStorage.setItem('lotshop_cart', JSON.stringify(cart));
    updateCartUI();
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
            totalCount += quantity;
            totalSum += parseInt(parts[3]) * quantity;
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