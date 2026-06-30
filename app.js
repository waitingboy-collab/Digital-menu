const restaurantName = localStorage.getItem("restaurantName") || "Нашето заведение";
const paperMenu = localStorage.getItem("paperMenuImage");
const menuData = JSON.parse(localStorage.getItem("restaurantMenu")) || [];

document.addEventListener("DOMContentLoaded", () => {
    const headerTitle = document.querySelector("header h1");
    if (headerTitle) headerTitle.innerText = restaurantName;

    initMenu();
});

function initMenu() {
    const container = document.getElementById("menu-container");
    const nav = document.getElementById("categories-nav");

    if (paperMenu) {
        if (nav) nav.style.display = "none"; 
        container.innerHTML = `
            <div class="mt-4 text-center">
                <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium mb-3">
                    📄 Разгледайте нашето хартиено меню
                </span>
                <p class="text-xs text-gray-400 mb-4">Можете да приближите снимката с два пръста (pinch-to-zoom)</p>
                <div class="overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
                    <img src="${paperMenu}" alt="Menu" class="w-full h-auto object-contain cursor-zoom-in active:scale-105 transition-transform duration-200">
                </div>
            </div>
        `;
    } else {
        if (nav) nav.style.display = "flex"; 
        renderCategories();
        renderMenu("Всички");
    }
}

function renderCategories() {
    const nav = document.getElementById("categories-nav");
    if (!nav) return;

    // Взимаме динамично категориите от базата данни
    const categories = ["Всички", ...new Set(menuData.map(item => item.category))];

    nav.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${cat}', this)" 
                class="category-btn px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200
                ${cat === 'Всички' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
            ${cat}
        </button>
    `).join("");
}

function filterCategory(category, button) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("bg-amber-600", "text-white", "shadow-sm");
        btn.classList.add("bg-gray-100", "text-gray-600");
    });
    button.classList.remove("bg-gray-100", "text-gray-600");
    button.classList.add("bg-amber-600", "text-white", "shadow-sm");
    renderMenu(category);
}

function renderMenu(selectedCategory) {
    const container = document.getElementById("menu-container");
    if (!container) return;
    
    const filteredItems = selectedCategory === "Всички" 
        ? menuData 
        : menuData.filter(item => item.category === selectedCategory);

    if (filteredItems.length === 0) {
        container.innerHTML = `<div class="text-center py-12"><p class="text-gray-400 text-sm">Няма въведени артикули в тази категория.</p></div>`;
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
                        ? `<span class="inline-flex items-center text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">● Налично</span>` 
                        : `<span class="inline-flex items-center text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium">✕ Изчерпано</span>`
                    }
                </div>
            </div>
        </div>
    `).join("");
}
