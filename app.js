// 1. АВТОМАТИЧНО ЗАСИЧАНЕ НА ЕЗИКА НА ТЕЛЕФОНА
// Ако езикът на устройството започва с 'en' (en-US, en-GB), системата стартира на EN. В противен случай – на BG.
let currentLang = navigator.language.startsWith('en') ? 'EN' : 'BG';

// Речник за превод на системните текстове на интерфейса
const translations = {
    BG: {
        subtitle: "Дигитално меню",
        allBtn: "Всички",
        availableBadge: "Налично",
        currency: "€",
        langButton: "EN" // Текстът върху бутона показва към кой език може да се превключи
    },
    EN: {
        subtitle: "Digital Menu",
        allBtn: "All",
        availableBadge: "Available",
        currency: "€",
        langButton: "BG"
    }
};

// Речник за превод на фиксираните категории
const categoryTranslations = {
    "Топли напитки": "Hot Drinks",
    "Напитки": "Beverages",
    "Салати": "Salads",
    "Основни": "Main Dishes",
    "Десерти": "Desserts"
};

// При зареждане на страницата
document.addEventListener("DOMContentLoaded", () => {
    // Настройваме първоначалния текст на бутона и подзаглавието според езика на телефона
    document.getElementById("lang-text").innerText = translations[currentLang].langButton;
    document.getElementById("menu-subtitle").innerText = translations[currentLang].subtitle;
    
    initMenu();
});

// Основна функция за зареждане на менюто
function initMenu() {
    const savedName = localStorage.getItem("restaurantName") || "Ресторант 'Балкани'";
    document.getElementById("restaurant-title").innerText = savedName;

    const localData = localStorage.getItem("restaurantMenu");
    const menuItems = localData ? JSON.parse(localData) : [];

    // Филтрираме само наличните артикули за клиентите
    const availableItems = menuItems.filter(item => item.available !== false);

    // Извличане на уникалните категории
    const categories = [...new Set(availableItems.map(item => item.category))];

    renderCategoriesNav(categories);
    renderMenuContent(availableItems, categories); // Тази функция вече е асинхронна (async)
}

// Генериране на категориите в навигацията
function renderCategoriesNav(categories) {
    const nav = document.getElementById("categories-nav");
    const t = translations[currentLang];

    let html = `
        <button onclick="scrollToCategory('all')" class="category-btn bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition whitespace-nowrap cursor-pointer">
            ${t.allBtn}
        </button>
    `;

    categories.forEach(cat => {
        const displayName = currentLang === 'EN' && categoryTranslations[cat] ? categoryTranslations[cat] : cat;
        html += `
            <button onclick="scrollToCategory('${cat}')" class="category-btn bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap cursor-pointer">
                ${displayName}
            </button>
        `;
    });

    nav.innerHTML = html;
}

// 2. АСИНХРОННО ВИЗУАЛИЗИРАНЕ НА МЕНЮТО С ОНЛАЙН ПРЕВОД В РЕАЛНО ВРЕМЕ
async function renderMenuContent(items, categories) {
    const container = document.getElementById("menu-container");
    const t = translations[currentLang];

    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400 text-sm">
                📢 Менюто е празно или няма налични артикули в момента.
            </div>
        `;
        return;
    }

    let html = "";

    // Използваме 'for...of' вместо 'forEach', за да можем да изчакаме (await) онлайн превода на всяко ястие
    for (const category of categories) {
        const categoryItems = items.filter(item => item.category === category);
        const displayCategoryName = currentLang === 'EN' && categoryTranslations[category] ? categoryTranslations[category] : category;

        html += `
            <section id="sec-${category}" class="space-y-3 scroll-mt-24">
                <h2 class="text-sm font-black text-gray-400 uppercase tracking-wider pl-1 border-l-3 border-amber-600">${displayCategoryName}</h2>
                <div class="space-y-3">
        `;

        for (const item of categoryItems) {
            const defaultImg = "https://via.placeholder.com/150";
            const itemImg = item.image && item.image.trim() !== "" ? item.image : defaultImg;

            // Логика за динамичен превод на името и описанието на ястието
            let displayName = item.name;
            let displayDesc = item.description || '';

            if (currentLang === 'EN') {
                displayName = await translateText(item.name);
                if (item.description) {
                    displayDesc = await translateText(item.description);
                }
            }

            html += `
                <div class="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex gap-3 items-center">
                    <img src="${itemImg}" alt="${displayName}" class="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0" onerror="this.src='${defaultImg}'">
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="font-bold text-gray-800 text-sm truncate">${displayName}</h3>
                            <span class="text-amber-600 font-extrabold text-sm flex-shrink-0">${t.currency}${Number(item.price).toFixed(2)}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${displayDesc}</p>
                        <div class="mt-2">
                            <span class="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                ${t.availableBadge}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </section>
        `;
    }

    container.innerHTML = html;
}

// 3. ПОМОЩНА ФУНКЦИЯ ЗА БЕЗПЛАТЕН ОНЛАЙН ПРЕВОД (Lingva API)
async function translateText(text) {
    if (!text || text.trim() === "") return "";
    try {
        // Извикваме бързо и леко безплатно API за превод от български (bg) на английски (en)
        const response = await fetch(`https://lingva.ml/api/v1/bg/en/${encodeURIComponent(text)}`);
        const data = await response.json();
        return data.translation || text;
    } catch (error) {
        console.error("Проблем с онлайн преводача:", error);
        return text; // Ако мрежата прекъсне, показва оригиналния български текст като резервен вариант
    }
}

// Плавно скролване до категориите
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

// РЪЧНО ПРЕВКЛЮЧВАНЕ ОТ БУТОНА (Ако клиентът реши сам да смени езика)
function toggleLanguage() {
    currentLang = currentLang === 'BG' ? 'EN' : 'BG';

    document.getElementById("lang-text").innerText = translations[currentLang].langButton;
    document.getElementById("menu-subtitle").innerText = translations[currentLang].subtitle;

    // Презареждаме менюто, което автоматично ще задейства или спре преводача
    const localData = localStorage.getItem("restaurantMenu");
    const menuItems = localData ? JSON.parse(localData) : [];
    const availableItems = menuItems.filter(item => item.available !== false);
    const categories = [...new Set(availableItems.map(item => item.category))];

    renderCategoriesNav(categories);
    renderMenuContent(availableItems, categories);
}
