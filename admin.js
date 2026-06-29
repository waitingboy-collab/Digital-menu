document.addEventListener("DOMContentLoaded", () => {
    // 1. Зареждане на името на ресторанта
    const savedName = localStorage.getItem("restaurantName") || "Моето заведение";
    const nameInput = document.getElementById("restaurant-name-input");
    if (nameInput) nameInput.value = savedName;

    // 2. Зареждане на хартиеното меню, ако има такова
    const savedPaperMenu = localStorage.getItem("paperMenuImage");
    if (savedPaperMenu) {
        showImagePreview(savedPaperMenu);
    }
    
    // 3. Първоначално изрисуване на текущото меню на екрана
    renderAdminMenu();

    // 4. Закачане на събитието за добавяне на нов артикул (Вече е на сигурно място тук)
    const addDishForm = document.getElementById("add-dish-form");
    if (addDishForm) {
        addDishForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Взимаме текущото състояние на менюто от базата
            const menu = getMenu();

            // Взимаме елементите от формата
            const nameEl = document.getElementById("dish-name");
            const catEl = document.getElementById("dish-category");
            const priceEl = document.getElementById("dish-price");
            const imgEl = document.getElementById("dish-image");
            const descEl = document.getElementById("dish-desc");

            // Създаваме новия обект
            const newItem = {
                id: Date.now(), // Уникално ID базирано на времето
                name: nameEl ? nameEl.value : "",
                category: catEl ? catEl.value : "Салати",
                price: priceEl ? parseFloat(priceEl.value) : 0.00,
                image: (imgEl && imgEl.value) ? imgEl.value : "https://via.placeholder.com/150",
                description: descEl ? descEl.value : "",
                available: true
            };

            // Добавяме го в масива
            menu.push(newItem);
            
            // Записваме го (тази функция автоматично ще извика и renderAdminMenu())
            saveMenu(menu);
            
            // Нулираме формата обратно до празни полета
            e.target.reset();
            
            // Връщаме дефолтния placeholder за снимка, тъй като reset() я изтрива
            if (imgEl) imgEl.value = "https://via.placeholder.com/150";
        });
    }
});

// --- Помощни функции за работа с менюто ---

function getMenu() {
    const localData = localStorage.getItem("restaurantMenu");
    if (localData) return JSON.parse(localData);
    
    const defaultMenu = [
        { id: 1, name: "Шопска салата", category: "Салати", price: 4.50, description: "Домати, краставици, сирене.", image: "https://via.placeholder.com/150", available: true },
        { id: 2, name: "Пилешка кавърма", category: "Основни", price: 7.90, description: "Пилешко месо със зеленчуци.", image: "https://via.placeholder.com/150", available: true }
    ];
    localStorage.setItem("restaurantMenu", JSON.stringify(defaultMenu));
    return defaultMenu;
}

function saveMenu(menu) {
    localStorage.setItem("restaurantMenu", JSON.stringify(menu));
    renderAdminMenu();
}

function saveRestaurantName() {
    const nameInput = document.getElementById("restaurant-name-input");
    if (nameInput) {
        localStorage.setItem("restaurantName", nameInput.value);
        alert("Името е запазено успешно!");
    }
}

// --- Управление на хартиеното меню ---

function previewAndProcessImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        try {
            localStorage.setItem("paperMenuImage", base64Image);
            showImagePreview(base64Image);
        } catch (error) {
            alert("Снимката е твърде голяма за паметта на браузъра! Моля, прикачете по-малък файл или компресирана снимка.");
            console.error(error);
        }
    };
    reader.readAsDataURL(file);
}

function showImagePreview(src) {
    const preview = document.getElementById("image-preview");
    const container = document.getElementById("image-preview-container");
    const manualSection = document.getElementById("manual-entry-section");

    if (preview) preview.src = src;
    if (container) container.classList.remove("hidden");
    if (manualSection) manualSection.classList.add("opacity-40");
}

function removePaperMenu() {
    if (confirm("Изтриване на заснетото хартиено меню?")) {
        localStorage.removeItem("paperMenuImage");
        const container = document.getElementById("image-preview-container");
        const manualSection = document.getElementById("manual-entry-section");
        
        if (container) container.classList.add("hidden");
        if (manualSection) manualSection.classList.remove("opacity-40");
    }
}

// --- Изрисуване (Рендериране) на администраторското меню ---

function renderAdminMenu() {
    const menu = getMenu();
    const container = document.getElementById("admin-menu-list");
    if (!container) return;
    
    if (menu.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400 py-4 text-center">Няма добавени артикули в менюто.</p>`;
        return;
    }

    container.innerHTML = menu.map(item => `
        <div class="py-4 flex justify-between items-center ${!item.available ? 'bg-gray-50 opacity-70' : ''}">
            <div>
                <h3 class="font-bold text-gray-800">${item.name} <span class="text-xs text-gray-400">(${item.category})</span></h3>
                <p class="text-sm text-amber-600 font-semibold">${Number(item.price).toFixed(2)} лв.</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="toggleAvailability(${item.id})" class="px-3 py-1 rounded text-xs font-semibold transition 
                    ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}">
                    ${item.available ? 'Налично' : 'Изчерпано'}
                </button>
                <button onclick="deleteItem(${item.id})" class="bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 p-2 rounded transition">Изтрий</button>
            </div>
        </div>
    `).join("");
}

function toggleAvailability(id) {
    let menu = getMenu();
    menu = menu.map(item => item.id === id ? { ...item, available: !item.available } : item);
    saveMenu(menu);
}

function deleteItem(id) {
    if (confirm("Сигурни ли сте, че искате да изтриете този артикул?")) {
        let menu = getMenu();
        menu = menu.filter(item => item.id !== id);
        saveMenu(menu);
    }
}
