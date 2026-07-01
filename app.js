// Глобално състояние на езика (По подразбиране е BG)
let currentLang = 'BG';

// Речник за превод на системните текстове на интерфейса
const translations = {
    BG: {
        subtitle: "Дигитално меню",
        allBtn: "Всички",
        availableBadge: "Налично",
        currency: "€",
        langButton: "EN"
    },
    EN: {
        subtitle: "Digital Menu",
        allBtn: "All",
        availableBadge: "Available",
        currency: "€",
        langButton: "BG"
    }
};

// Речник за превод на имената на категориите
const categoryTranslations = {
    "Топли напитки": "Hot Drinks",
    "Напитки": "Beverages",
    "Салати": "Salads",
    "Основни": "Main Dishes",
    "Десерти": "Desserts"
};

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
});

// Основна функция за зареждане на менюто
function initMenu() {
    // 1. Зареждане на името на ресторанта
    const savedName = localStorage.getItem("restaurantName") || "Ресторант 'Балкани'";
    document.getElementById("restaurant-title").innerText = savedName;

    // 2. Вземане на артикулите от localStorage
    const localData = localStorage.getItem("restaurantMenu");
    const menuItems = localData ? JSON.parse(localData) : [];

    // Филтрираме само НАЛИЧНИТЕ артикули (Изчерпаните не се показват на клиентите)
    const availableItems = menuItems.filter(item => item.available !== false);

    // 3. Извличане на уникалните категории от наличните артикули
    const categories = [...new Set(availableItems.map(item => item.category))];

    renderCategoriesNav(categories);
    renderMenuContent(availableItems, categories);
}

// Генериране на навигационната лента с категории
function renderCategoriesNav(categories) {
    const nav = document.getElementById("categories-nav");
    const t = translations[currentLang];

    // Бутон "Всички"
    let html = `
        <button onclick="scrollToCategory('all')" class="category-btn bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition whitespace-nowrap cursor-pointer">
            ${t.allBtn}
        </button>
    `;

    // Бутони за всяка отделна категория
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

// Визуализиране на ястията, групирани по категории
function renderMenuContent(items, categories) {
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

    categories.forEach(category => {
        const categoryItems = items.filter(item => item.category === category);
        const displayCategoryName = currentLang === 'EN' && categoryTranslations[category] ? categoryTranslations[category] : category;

        html += `
            <section id="sec-${category}" class="space-y-3 scroll-mt-24">
                <h2 class="text-sm font-black text-gray-400 uppercase tracking-wider pl-1 border-l-3 border-amber-600">${displayCategoryName}</h2>
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
                            <span class="text-amber-600 font-extrabold text-sm flex-shrink-0">${t.currency}${Number(item.price).toFixed(2)}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.description || ''}</p>
                        <div class="mt-2">
                            <span class="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                ${t.availableBadge}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </section>
        `;
    });

    container.innerHTML = html;
}

// Плавно скролване до избраната секция и визуално активиране на бутона
function scrollToCategory(categoryName) {
    // Деактивиране на стария активен бутон
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("bg-amber-600", "text-white", "font-bold");
        btn.classList.add("bg-gray-100", "text-gray-600", "font-semibold");
    });

    // Маркиране на кликнатия бутон като активен
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

// ФУНКЦИЯ ЗА ПРЕВКЛЮЧВАНЕ НА ЕЗИКА (Вика се от бутона в хедъра)
function toggleLanguage() {
    // Сменяме текущия език
    currentLang = currentLang === 'BG' ? 'EN' : 'BG';

    // 1. Обновяваме текста на самия бутон (ако сме на EN, бутонът предлага превключване към BG и обратно)
    document.getElementById("lang-text").innerText = translations[currentLang].langButton;

    // 2. Обновяваме подзаглавието в хедъра ("Дигитално меню" / "Digital Menu")
    document.getElementById("menu-subtitle").innerText = translations[currentLang].subtitle;

    // 3. Преначертаваме навигацията и съдържанието с новия език
    const localData = localStorage.getItem("restaurantMenu");
    const menuItems = localData ? JSON.parse(localData) : [];
    const availableItems = menuItems.filter(item => item.available !== false);
    const categories = [...new Set(availableItems.map(item => item.category))];

    renderCategoriesNav(categories);
    renderMenuContent(availableItems, categories);
}
