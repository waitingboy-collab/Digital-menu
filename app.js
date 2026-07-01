// Променлива за следене на текущия активиран език
let currentLang = navigator.language.startsWith('en') ? 'EN' : 'BG';

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    
    // Автоматично задействане на езика според телефона при първо зареждане
    setTimeout(() => {
        if (currentLang === 'EN') {
            triggerGoogleTranslate('en');
            document.getElementById("lang-text").innerText = "BG";
        }
    }, 1000); // Малко изчакване, за да зареди скрипта на Google
});

function initMenu() {
    const savedName = localStorage.getItem("restaurantName") || "Ресторант 'Балкани'";
    document.getElementById("restaurant-title").innerText = savedName;

    const localData = localStorage.getItem("restaurantMenu");
    const menuItems = localData ? JSON.parse(localData) : [];

    // Показваме само наличните
    const availableItems = menuItems.filter(item => item.available !== false);
    const categories = [...new Set(availableItems.map(item => item.category))];

    renderCategoriesNav(categories);
    renderMenuContent(availableItems, categories);
}

function renderCategoriesNav(categories) {
    const nav = document.getElementById("categories-nav");
    let html = `
        <button onclick="scrollToCategory('all')" class="category-btn bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition whitespace-nowrap cursor-pointer">Всички</button>
    `;
    categories.forEach(cat => {
        html += `
            <button onclick="scrollToCategory('${cat}')" class="category-btn bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap cursor-pointer">${cat}</button>
        `;
    });
    nav.innerHTML = html;
}

function renderMenuContent(items, categories) {
    const container = document.getElementById("menu-container");
    if (items.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-gray-400 text-sm">📢 Менюто е празно...</div>`;
        return;
    }

    let html = "";
    categories.forEach(category => {
        const categoryItems = items.filter(item => item.category === category);
        html += `
            <section id="sec-${category}" class="space-y-3 scroll-mt-24">
                <h2 class="text-sm font-black text-gray-400 uppercase tracking-wider pl-1 border-l-3 border-amber-600">${category}</h2>
                <div class="space-y-3">
        `;
        categoryItems.forEach(item => {
            const defaultImg = "https://via.placeholder.com/150";
            const itemImg = item.image && item.image.trim() !== "" ? item.image : defaultImg;
            html += `
                <div class="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex gap-3 items-center">
                    <img src="${itemImg}" alt="${item.name}" class="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0" onerror="this.src='${defaultImg}'">
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="font-bold text-gray-800 text-sm truncate">${item.name}</h3>
                            <span class="text-amber-600 font-extrabold text-sm flex-shrink-0">€${Number(item.price).toFixed(2)}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.description || ''}</p>
                        <div class="mt-2">
                            <span class="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Налично
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div></section>`;
    });
    container.innerHTML = html;
}

// ФУНКЦИЯ, КОЯТО КЛИКВА ВЪРХУ СКРИТИЯ СЕЛЕКТОР НА GOOGLE TRANSLATE
function triggerGoogleTranslate(langCode) {
    const translateSelect = document.querySelector('.goog-te-combo');
    if (translateSelect) {
        translateSelect.value = langCode;
        translateSelect.dispatchEvent(new Event('change'));
    }
}

// РЪЧНО ПРЕВКЛЮЧВАНЕ ОТ НАШИЯ БУТОН
function toggleGoogleLanguage() {
    const langText = document.getElementById("lang-text");
    if (currentLang === 'BG') {
        currentLang = 'EN';
        langText.innerText = "BG";
        triggerGoogleTranslate('en');
    } else {
        currentLang = 'BG';
        langText.innerText = "EN";
        triggerGoogleTranslate('bg');
    }
}

function scrollToCategory(categoryName) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("bg-amber-600", "text-white", "font-bold");
        btn.classList.add("bg-gray-100", "text-gray-600", "font-semibold");
    });
    const clickedBtn = event.currentTarget;
    clickedBtn.classList.remove("bg-gray-100", "text-gray-600", "font-semibold");
    clickedBtn.classList.add("bg-amber-600", "text-white", "font-bold");

    if (categoryName === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const element = document.getElementById(`sec-${categoryName}`);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
}
