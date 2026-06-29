function getFreshMenuData() {
    return JSON.parse(localStorage.getItem("restaurantMenu")) || [];
}

let currentLang = localStorage.getItem("clientLanguage") || "bg";

const translations = {
    bg: { subtitle: "Дигитално меню", available: "● Налично", empty: "Всички", outOfStock: "✕ Изчерпано", zoomTip: "Можете да приближите снимката с два пръста (pinch-to-zoom)", paperTitle: "📄 Разгледайте нашето хартиено меню", noItems: "Все още няма въведени артикули." },
    en: { subtitle: "Digital Menu", available: "● Available", empty: "All", outOfStock: "✕ Out of stock", zoomTip: "You can zoom in with two fingers (pinch-to-zoom)", paperTitle: "📄 View our paper menu", noItems: "No items found in this category." },
    el: { subtitle: "Ψηфιακό Μενού", available: "● Διαθέσιμο", empty: "Όλα", outOfStock: "✕ Εξαντλήθηκε", zoomTip: "Μπορείτε να μεγεθύνετε με δύο δάχτυλα (pinch-to-zoom)", paperTitle: "📄 Δείτε το έντυπο μενού μας", noItems: "Δεν βρέθηκαν προϊόντα σε αυτήν την κατηγορία." },
    ru: { subtitle: "Цифровое меню", available: "● В наличии", empty: "Все", outOfStock: "✕ Нет в наличии", zoomTip: "Вы можете увеличить изображение двумя пальцами (pinch-to-zoom)", paperTitle: "📄 Посмотреть наше бумажное меню", noItems: "В этой категории пока нет товаров." },
    pl: { subtitle: "Cyfrowe Menu", available: "● Dostępny", empty: "Wszystko", outOfStock: "✕ Brak", zoomTip: "Możesz powiększyć dwoma palcami (pinch-to-zoom)", paperTitle: "📄 Zobacz nasze menu papierowe", noItems: "Brak artykułów w tej kategorii." },
    tr: { subtitle: "Dijital Menü", available: "● Mevcut", empty: "Hepsi", outOfStock: "✕ Tükendi", zoomTip: "İki parмаğınızla yakınlaştırabilirsiniz (pinch-to-zoom)", paperTitle: "📄 Kağıt menümüzü görüntüleyin", noItems: "Bu kategoride henüz ürün bulunmamaktadır." }
};

document.addEventListener("DOMContentLoaded", () => {
    const restaurantName = localStorage.getItem("restaurantName") || "Нашето заведение";
    const langSelect = document.getElementById("language-select");
    if (langSelect) langSelect.value = currentLang;
    const headerTitle = document.querySelector("header h1");
    if (headerTitle) headerTitle.innerText = restaurantName;
    initMenu();
});

function initMenu() {
    const container = document.getElementById("menu-container");
    const nav = document.getElementById("categories-nav");
    const subTitle = document.getElementById("sub-title");
    if (subTitle) subTitle.innerText = translations[currentLang].subtitle;

    // Вземаме снимката в реално време при инициализация
    const paperMenu = localStorage.getItem("paperMenuImage");

    if (paperMenu) {
        if (nav) nav.style.display = "none"; 
        container.innerHTML = `
            <div class="mt-4 text-center">
                <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium mb-3">
                    ${translations[currentLang].paperTitle}
                </span>
                <p class="text-xs text-gray-400 mb-4">${translations[currentLang].zoomTip}</p>
                <div class="overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
                    <img src="${paperMenu}" alt="Menu" class="w-full h-auto object-contain cursor-zoom-in active:scale-105 transition-transform duration-200">
                </div>
            </div>
        `;
    } else {
        if (nav) nav.style.display = "flex"; 
        renderCategories();
        renderMenu(translations[currentLang].empty);
    }
}

function changeLanguage(langCode) {
    currentLang = langCode;
    localStorage.setItem("clientLanguage", langCode);
    initMenu();
}

function renderCategories() {
    const nav = document.getElementById("categories-nav");
    if (!nav) return;
    
    const allText = translations[currentLang].empty;
    const menuData = getFreshMenuData();
    const categories = [allText, ...new Set(menuData.map(item => item.category))];
    
    nav.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${cat}', this)" 
                class="category-btn px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                ${cat === allText ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
            ${cat}
        </button>
    `).join("");
}

function filterCategory(category, button) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("bg-amber-600", "text-white", "shadow-sm");
        btn.classList.add("bg-gray-200", "text-gray-700");
    });
    button.classList.remove("bg-gray-200", "text-gray-700");
    button.classList.add("bg-amber-600", "text-white", "shadow-sm");
    renderMenu(category);
}

function renderMenu(selectedCategory) {
    const container = document.getElementById("menu-container");
    if (!container) return;
    
    const allText = translations[currentLang].empty;
    const menuData = getFreshMenuData();
    
    const filteredItems = selectedCategory === allText 
        ? menuData 
        : menuData.filter(item => item.category === selectedCategory);
        
    if (filteredItems.length === 0) {
        container.innerHTML = `<div class="text-center py-12"><p class="text-gray-400 text-sm">${translations[currentLang].noItems}</p></div>`;
        return;
    }
    
    container.innerHTML = filteredItems.map(item => `
        <div class="bg-white rounded-2xl shadow-xs overflow-hidden flex my-3 border border-gray-100 transition-all ${!item.available ? 'opacity-40 filter grayscale' : ''}">
            <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}" class="w-24 h-24 md:w-28 md:h-28 object-cover flex-shrink-0">
            <div class="p-3 flex flex-col justify-between flex-1 min-w-0">
                <div>
                    <div class="flex justify-between items-start gap-2">
                        <h3 class="font-bold text-gray-800 truncate text-base">${item.name}</h3>
                        <span class="text-amber-600 font-extrabold text-sm flex-shrink-0">&euro;${Number(item.price).toFixed(2)}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.description || ''}</p>
                </div>
                <div class="flex justify-between items-center mt-1">
                    ${item.available 
                        ? `<span class="inline-flex items-center text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">${translations[currentLang].available}</span>` 
                        : `<span class="inline-flex items-center text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium">${translations[currentLang].outOfStock}</span>`
                    }
                </div>
            </div>
        </div>
    `).join("");
}
