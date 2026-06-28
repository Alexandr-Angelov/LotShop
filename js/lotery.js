let cart = JSON.parse(localStorage.getItem('lotshop_cart')) || {};

const singleTicketPrizes = [
    { text: "Ви виграли нічого", value: 0 },
    { text: "Ви виграли 5 гривень!", value: 5 },
    { text: "Ви виграли 20 гривень!", value: 20 },
    { text: "Ви виграли 50 гривень!", value: 50 },
    { text: "Ви виграли 100 гривень!", value: 100 },
    { text: "Ви виграли 250 гривень!", value: 250 },
    { text: "Ви виграли 500 гривень!", value: 500 },
    { text: "Ви виграли 1000 гривень!", value: 1000 },
    { text: "Ви виграли 5000 гривень!", value: 5000 },
    { text: "Ви виграли 50000 гривень!", value: 50000 },
    { text: "Ви виграли 100000 гривень!", value: 100000 },
    { text: "Ви головний приз - 500000 гривень!", value: 500000 }
];

function getWeightedPrizeObjectTicket1() {
    const roll = Math.random() * 100;
    if (roll < 45) return singleTicketPrizes[0];
    if (roll < 70) return singleTicketPrizes[1];
    if (roll < 85) return singleTicketPrizes[2];
    if (roll < 93) return singleTicketPrizes[3];
    if (roll < 97) return singleTicketPrizes[4];
    if (roll < 99) return singleTicketPrizes[5];
    if (roll < 99.6) return singleTicketPrizes[6];
    if (roll < 99.85) return singleTicketPrizes[7];
    if (roll < 99.95) return singleTicketPrizes[8];
    if (roll < 99.98) return singleTicketPrizes[9];
    if (roll < 99.995) return singleTicketPrizes[10];
    return singleTicketPrizes[11];
}

const rowPrizesPool = [
    { text: "5 гривень!", value: 5 },
    { text: "20 гривень!", value: 20 },
    { text: "50 гривень!", value: 50 },
    { text: "100 гривень!", value: 100 },
    { text: "250 гривень!", value: 250 },
    { text: "5000 гривень!", value: 5000 },
    { text: "500000 гривень!", value: 500000 }
];

function getWeightedPrizeObjectTicket2() {
    const roll = Math.random() * 100;
    if (roll < 60) return rowPrizesPool[0];
    if (roll < 85) return rowPrizesPool[1];
    if (roll < 95) return rowPrizesPool[2];
    if (roll < 98.5) return rowPrizesPool[3];
    if (roll < 99.7) return rowPrizesPool[4];
    if (roll < 99.95) return rowPrizesPool[5];
    return rowPrizesPool[6];
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateTicketBadges();
    setupInitialState();
    
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = '../html/cart.html';
        });
    }
});

function initiateTicketPurchase(type) {
    const qtyInput = document.getElementById(`quantity-${type}`);
    const qty = parseInt(qtyInput.value) || 1;
    if (qty <= 0) {
        alert('Введіть коректну кількість!');
        return;
    }
    localStorage.setItem('pending_ticket_type', type);
    localStorage.setItem('pending_ticket_qty', qty);
    window.location.href = 'pay.html';
}

function updateTicketBadges() {
    const b1 = parseInt(localStorage.getItem('ticket_balance_1')) || 0;
    const b2 = parseInt(localStorage.getItem('ticket_balance_2')) || 0;
    
    if (document.getElementById('badge-1')) document.getElementById('badge-1').textContent = `Доступно: ${b1} шт.`;
    if (document.getElementById('badge-2')) document.getElementById('badge-2').textContent = `Доступно: ${b2} шт.`;

    if (document.getElementById('openAllBtn1')) {
        document.getElementById('openAllBtn1').style.display = b1 > 1 ? 'block' : 'none';
    }
    if (document.getElementById('openAllBtn2')) {
        document.getElementById('openAllBtn2').style.display = b2 > 1 ? 'block' : 'none';
    }
}

function setupInitialState() {
    const b1 = parseInt(localStorage.getItem('ticket_balance_1')) || 0;
    if (b1 > 0 && !localStorage.getItem('t1_active_generated')) {
        generateTicketData(1);
    }
    const b2 = parseInt(localStorage.getItem('ticket_balance_2')) || 0;
    if (b2 > 0 && !localStorage.getItem('t2_active_generated')) {
        generateTicketData(2);
    }
}

function generateTicketData(type) {
    if (type === 1) {
        const content = document.getElementById('content1');
        if (!content) return;
        const obj = getWeightedPrizeObjectTicket1();
        content.textContent = obj.text;
        localStorage.setItem('ticket_1_prize_text', obj.text);
        localStorage.setItem('t1_active_generated', 'true');
    } else {
        const content = document.getElementById('content2');
        if (!content) return;

        const luckyNumber = Math.floor(Math.random() * 9) + 1;
        let html = `<div style="margin-bottom:8px;">Цільове число: <strong style="color:#6FD1D7; font-size:1.3rem;">${luckyNumber}</strong></div>`;
        
        const rows = [];
        for (let i = 0; i < 3; i++) {
            let rowNum;
            if (Math.random() * 100 < 25) {
                rowNum = luckyNumber;
            } else {
                rowNum = Math.floor(Math.random() * 9) + 1;
                if (rowNum === luckyNumber) {
                    rowNum = rowNum === 9 ? 8 : rowNum + 1;
                }
            }
            rows.push({ num: rowNum, prizeObj: getWeightedPrizeObjectTicket2() });
        }

        let isWinner = false;
        rows.forEach((row, i) => {
            const match = row.num === luckyNumber;
            if (match) isWinner = true;
            html += `
                <div class="lotery-row">
                    Ряд ${i+1}: Число <strong>${row.num}</strong> — Приз: <span style="color:#6FD1D7">${row.prizeObj.text}</span>
                    ${match ? ' <span style="color:#ff4a4a; font-weight:900;">(ВИГРАШ!)</span>' : ''}
                </div>
            `;
        });

        content.innerHTML = html;
        localStorage.setItem('ticket_2_has_win', isWinner ? 'true' : 'false');
        localStorage.setItem('t2_active_generated', 'true');
    }
}

function scratchTicket(type) {
    const balance = parseInt(localStorage.getItem(`ticket_balance_${type}`)) || 0;
    if (balance <= 0) {
        alert('У вас немає куплених квитків цього типу!');
        return;
    }
    
    const cover = document.getElementById(`cover${type}`);
    if (cover && !cover.classList.contains('scratched')) {
        cover.classList.add('scratched');
        
        let newBalance = balance - 1;
        localStorage.setItem(`ticket_balance_${type}`, newBalance);
        updateTicketBadges();

        if (type === 1) {
            const prizeText = localStorage.getItem('ticket_1_prize_text') || '';
            if (!prizeText.includes('нічого')) {
                document.getElementById('claimBtn1').style.display = 'block';
            }
        } else {
            const hasWin = localStorage.getItem('ticket_2_has_win') === 'true';
            if (hasWin) {
                document.getElementById('claimBtn2').style.display = 'block';
            }
        }

        if (newBalance > 0) {
            document.getElementById(`nextBtn${type}`).style.display = 'block';
        }
    }
}

function openAllTickets(type) {
    const balance = parseInt(localStorage.getItem(`ticket_balance_${type}`)) || 0;
    if (balance <= 0) return;

    let totalWinAmount = 0;
    let winCount = 0;

    if (type === 1) {
        const activePrize = localStorage.getItem('ticket_1_prize_text') || '';
        singleTicketPrizes.forEach(p => {
            if (activePrize === p.text) totalWinAmount += p.value;
        });

        for (let i = 0; i < balance - 1; i++) {
            const obj = getWeightedPrizeObjectTicket1();
            totalWinAmount += obj.value;
        }
    } else {
        for (let i = 0; i < balance; i++) {
            const luckyNumber = Math.floor(Math.random() * 9) + 1;
            for (let r = 0; r < 3; r++) {
                let rowNum = Math.random() * 100 < 25 ? luckyNumber : Math.floor(Math.random() * 9) + 1;
                if (rowNum === luckyNumber) {
                    const obj = getWeightedPrizeObjectTicket2();
                    totalWinAmount += obj.value;
                }
            }
        }
    }

    localStorage.setItem(`ticket_balance_${type}`, 0);
    updateTicketBadges();

    const cover = document.getElementById(`cover${type}`);
    if (cover) cover.classList.add('scratched');
    
    document.getElementById(`nextBtn${type}`).style.display = 'none';

    const content = document.getElementById(`content${type}`);
    if (type === 1) {
        content.innerHTML = `<div style="color:#6FD1D7; font-size:1.2rem;">Усі квитки (${balance} шт.) відкрито!</div><div>Загальний виграш: <strong style="color:#ff4a4a">${totalWinAmount} ₴</strong></div>`;
    } else {
        content.innerHTML = `<div style="color:#6FD1D7; font-size:1.2rem;">Усі ряди у ${balance} квитках перевірено!</div><div>Загальний виграш: <strong style="color:#ff4a4a">${totalWinAmount} ₴</strong></div>`;
    }

    if (totalWinAmount > 0) {
        document.getElementById(`claimBtn${type}`).style.display = 'block';
    } else {
        alert(`Ви відкрили всі квитки (${balance} шт.), але, на жаль, нічого не виграли.`);
    }
}

function prepareNextTicket(type) {
    localStorage.removeItem(`t${type}_active_generated`);
    
    document.getElementById(`claimBtn${type}`).style.display = 'none';
    document.getElementById(`nextBtn${type}`).style.display = 'none';
    
    const cover = document.getElementById(`cover${type}`);
    if (cover) cover.classList.remove('scratched');
    
    generateTicketData(type);
}

function claimPrize() {
    alert('Помилка системи: Не вдалося вивести гроші, недостатньо коштів на транзакційному рахунку лотереї!');
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
            totalSum += parseInt(parts[parts.length - 1]) * quantity;
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