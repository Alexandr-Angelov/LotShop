let cart = JSON.parse(localStorage.getItem('lotshop_cart')) || {};

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = '../html/cart.html';
        });
    }
});

function updateCartUI() {
    const countElem = document.getElementById('cartCount');
    const sumElem = document.getElementById('cartSum');
    if (!countElem || !sumElem) return;

    let totalCount = 0;
    let totalSum = 0;

    Promise.all([
        fetch('../db/sportshop_db.json').then(res => res.json()).catch(() => []),
        fetch('../db/moneyshop_db.json').then(res => res.json()).catch(() => [])
    ]).then(([sportProducts, moneyProducts]) => {
        for (let id in cart) {
            const qty = cart[id];
            if (qty <= 0) continue;

            let product = sportProducts.find(p => p.id == id);
            if (!product) {
                product = moneyProducts.find(p => p.id == id);
            }

            if (product) {
                totalCount += qty;
                const price = product.price || 100;
                totalSum += price * qty;
            }
        }
        countElem.textContent = `${totalCount} шт.`;
        sumElem.textContent = `${totalSum} ₴`;
    }).catch(() => {
        countElem.textContent = '0 шт.';
        sumElem.textContent = '0 ₴';
    });
}