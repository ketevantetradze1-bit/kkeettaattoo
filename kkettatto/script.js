document.addEventListener("DOMContentLoaded", () => {
    setupUI();
    
    // გვერდების ლოგიკის გამოძახება ID-ის მიხედვით
    if (document.getElementById('products-grid')) initShop();
    if (document.getElementById('rent-grid')) initRent();
    if (document.getElementById('consulting-grid')) initConsulting();
    if (document.getElementById('forum-list')) initForum();
    if (document.getElementById('regForm')) setupRegistration();
});

// --- FETCH & DATA ---
async function getDB() {
    try {
        const req = await fetch('database.json');
        if(!req.ok) throw new Error("JSON Error");
        return await req.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// --- SHOP ---
let shopItems = [];
async function initShop() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<p class="loading">იტვირთება...</p>';
    const db = await getDB();
    if(db && db.products) {
        shopItems = db.products;
        renderShop(shopItems);
    } else {
        grid.innerHTML = '<p>შეცდომა: Live Server ჩართულია?</p>';
    }
}

function renderShop(items) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = items.map(i => `
        <div class="card ${i.isGold ? 'gold' : ''}">
            ${i.isGold ? '<span class="gold-badge">GOLD</span>' : ''}
            <img src="${i.img}" alt="${i.name}">
            <div class="card-content">
                <div>
                    <h3>${i.name}</h3>
                    <small>${i.region} | ${i.category}</small>
                </div>
                <div class="price">${i.price} ₾</div>
                <button class="btn btn-primary" onclick="addToCart('${i.name}', ${i.price})">კალათაში</button>
            </div>
        </div>
    `).join('');
}

window.filterShop = function() {
    const cat = document.getElementById('cat').value;
    const reg = document.getElementById('reg').value;
    const price = document.getElementById('price').value;
    document.getElementById('price-val').innerText = price;

    const filtered = shopItems.filter(i => 
        (cat === 'all' || i.category === cat) &&
        (reg === 'all' || i.region === reg) &&
        (i.price <= price)
    );
    renderShop(filtered);
}

// --- RENT ---
async function initRent() {
    const grid = document.getElementById('rent-grid');
    const db = await getDB();
    if(!db) return;
    
    window.rentData = db.rent; // შენახვა ფილტრაციისთვის
    renderRent(db.rent);
}

function renderRent(items) {
    document.getElementById('rent-grid').innerHTML = items.map(i => `
        <div class="card">
            <img src="${i.img}">
            <div class="card-content">
                <h3>${i.name}</h3>
                <p>ტიპი: ${i.type} | რეგიონი: ${i.region}</p>
                <div class="price">${i.price} ₾/დღე</div>
                <button class="btn btn-outline" onclick="alert('დაჯავშნის მოთხოვნა გაგზავნილია!')">დაჯავშნა</button>
            </div>
        </div>
    `).join('');
}

window.filterRent = function() {
    const type = document.getElementById('r-type').value;
    const reg = document.getElementById('r-reg').value;
    const filtered = window.rentData.filter(i => 
        (type === 'all' || i.type === type) &&
        (reg === 'all' || i.region === reg)
    );
    renderRent(filtered);
}

// --- CONSULTING ---
async function initConsulting() {
    const grid = document.getElementById('consulting-grid');
    const db = await getDB();
    if(db) {
        grid.innerHTML = db.consulting.map(c => `
            <div class="card" style="text-align:center;">
                <img src="${c.img}" style="width:120px; height:120px; border-radius:50%; margin:20px auto;">
                <div class="card-content">
                    <h3>${c.name}</h3>
                    <p style="color:var(--accent); font-weight:bold;">${c.position}</p>
                    <p style="font-size:0.9rem; margin:10px 0;">${c.desc}</p>
                    <div class="price">${c.price}</div>
                    <button class="btn btn-primary">დაჯავშნა</button>
                </div>
            </div>
        `).join('');
    }
}

// --- FORUM ---
async function initForum() {
    const list = document.getElementById('forum-list');
    const db = await getDB();
    if(db) {
        list.innerHTML = db.forum.map(f => `
            <div class="glass-panel" style="margin-bottom:15px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3><i class="fas fa-comments" style="color:var(--accent); margin-right:10px;"></i> ${f.title}</h3>
                    <small style="color:#ccc;">ავტორი: ${f.author}</small>
                </div>
                <div class="btn btn-outline" style="padding:5px 15px;">${f.replies} პასუხი</div>
            </div>
        `).join('');
    }
}

// --- UI & UTILS ---
function setupUI() {
    // Burger
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if(burger) burger.addEventListener('click', () => nav.classList.toggle('active'));

    // Header Scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        header.classList.toggle('scrolled', window.scrollY > 50);
        
        // Scroll Top Button
        const btn = document.getElementById('scrollTop');
        if(btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });

    // Cart Init
    updateCartCount();

    // Cookies
    if(!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => document.getElementById('cookieBanner')?.classList.add('show'), 2000);
    }
}

// Cart Logic
window.addToCart = function(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({name, price});
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(name + " დაემატა კალათაში!");
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const el = document.getElementById('cart-count');
    if(el) el.innerText = cart.length;
}

window.acceptCookies = function() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookieBanner').classList.remove('show');
}

window.scrollToTop = function() { window.scrollTo(0,0); }

// Registration Logic
function setupRegistration() {
    window.switchTab = function(type) {
        document.getElementById('btn-user').className = type === 'user' ? 'btn btn-primary' : 'btn btn-outline';
        document.getElementById('btn-farmer').className = type === 'farmer' ? 'btn btn-primary' : 'btn btn-outline';
        document.getElementById('farmer-field').style.display = type === 'farmer' ? 'block' : 'none';
    }
    
    window.togglePass = function() {
        const inp = document.getElementById('pass');
        inp.type = inp.type === 'password' ? 'text' : 'password';
    }

    document.getElementById('regForm').onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+995[0-9]{9}$/;

        if(!emailRegex.test(email)) return alert('არასწორი ელ-ფოსტა!');
        if(!phoneRegex.test(phone)) return alert('ნომერი უნდა იყოს ფორმატით: +995555000000');

        alert('რეგისტრაცია წარმატებულია!');
        window.location.href = 'dashboard.html';
    }
}

// AI Chat
window.sendAI = function() {
    const inp = document.getElementById('ai-input');
    const body = document.getElementById('chat-body');
    if(!inp.value) return;

    body.innerHTML += `<div style="text-align:right; margin:10px;"><span style="background:var(--primary); padding:10px; border-radius:15px; color:white;">${inp.value}</span></div>`;
    
    setTimeout(() => {
        let ans = "ვერ გავიგე, გთხოვთ დააზუსტოთ.";
        if(inp.value.includes('ფასი')) ans = "ფასები დამოკიდებულია პროდუქტზე, იხილეთ მაღაზია.";
        if(inp.value.includes('გამარჯობა')) ans = "გამარჯობა! მე ვარ AgroAI, რით დაგეხმაროთ?";
        if(inp.value.includes('ამინდი')) ans = "ამინდი ხელსაყრელია რთველისთვის.";
        
        body.innerHTML += `<div style="text-align:left; margin:10px;"><span style="background:#eee; padding:10px; border-radius:15px; color:#333;">${ans}</span></div>`;
        body.scrollTop = body.scrollHeight;
    }, 1000);
    inp.value = '';
}