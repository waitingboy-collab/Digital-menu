document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("restaurantName") || "Моето заведение";
    const nameInput = document.getElementById("restaurant-name-input");
    if (nameInput) nameInput.value = savedName;

    const savedPaperMenu = localStorage.getItem("paperMenuImage");
    if (savedPaperMenu) {
        showImagePreview(savedPaperMenu);
    }
    
    renderAdminMenu();

    const addDishForm = document.getElementById("add-dish-form");
    if (addDishForm) {
        addDishForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const menu = getMenu();
            const nameEl = document.getElementById("dish-name");
            const catEl = document.getElementById("dish-category");
            const priceEl = document.getElementById("dish-price");
            const imgEl = document.getElementById("dish-image");
            const descEl = document.getElementById("dish-desc");

            const newItem = {
                id: Date.now(),
                name: nameEl ? nameEl.value : "",
                category: catEl ? catEl.value : "Салати",
                price: priceEl ? parseFloat(priceEl.value) : 0.00,
                image: (imgEl && imgEl.value) ? imgEl.value : "https://via.placeholder.com/150",
                description: descEl ? descEl.value : "",
                available: true
            };

            menu.push(newItem);
            saveMenu(menu);
            
            e.target.reset();
            if (imgEl) imgEl.value = "https://via.placeholder.com/150";
        });
    }
});

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

function previewAndProcessImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Компресия на изображението чрез Canvas елемент
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1024; // Оптимален размер за мобилен екран
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Намаляване на качеството до 70% за драстично пестене на място
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

            try {
                localStorage.setItem("paperMenuImage", compressedBase64);
                showImagePreview(compressedBase64);
            } catch (error) {
                alert("Паметта на браузъра е пълна. Моля, изтрийте други елементи.");
                console.error(error);
            }
        };
        img.src = e.target.result;
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
        if (manualSection) manualSection.remove("opacity-40");
        document.getElementById('camera-input').value = '';
    }
}

function renderAdminMenu() {
    const menu = getMenu();
    const container = document.getElementById("admin-menu-list");
    if (!container) return;
    
    if (menu.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400 py-4 text-center">Няма добавени артикули в менюто.</p>`;
        return;
    }
    container.innerHTML = menu.map(item => `
        <div class="py-4 flex justify-between items-center border-b border-gray-100 last:border-0 ${!item.available ? 'bg-gray-50 opacity-70' : ''}">
            <div>
                <h3 class="font-bold text-gray-800">${item.name} <span class="text-xs text-gray-400">(${item.category})</span></h3>
                <p class="text-sm text-amber-600 font-semibold">&euro; ${Number(item.price).toFixed(2)}</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="toggleAvailability(${item.id})" class="px-3 py-1 rounded text-xs font-semibold transition 
                    ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}">
                    ${item.available ? 'Налично' : 'Изчерпано'}
                </button>
                <button onclick="deleteItem(${item.id})" class="bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 p-2 rounded transition text-xs font-medium">Изтрий</button>
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
