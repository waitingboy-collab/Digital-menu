document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("restaurantName") || "Моето заведение";
    document.getElementById("restaurant-name-input").value = savedName;

    const savedPaperMenu = localStorage.getItem("paperMenuImage");
    if (savedPaperMenu) {
        showImagePreview(savedPaperMenu);
    }
    renderAdminMenu();
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
    const name = document.getElementById("restaurant-name-input").value;
    localStorage.setItem("restaurantName", name);
    alert("Името е запазено успешно!");
}

function previewAndProcessImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        localStorage.setItem("paperMenuImage", base64Image);
        showImagePreview(base64Image);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(src) {
    document.getElementById("image-preview").src = src;
    document.getElementById("image-preview-container").classList.remove("hidden");
    document.getElementById("manual-entry-section").classList.add("opacity-40");
}

function removePaperMenu() {
    if (confirm("Изтриване на заснетото хартиено меню?")) {
        localStorage.removeItem("paperMenuImage");
        document.getElementById("image-preview-container").classList.add("hidden");
        document.getElementById("manual-entry-section").classList.remove("opacity-40");
    }
}

function renderAdminMenu() {
    const menu = getMenu();
    const container = document.getElementById("admin-menu-list");
    
    container.innerHTML = menu.map(item => `
        <div class="py-4 flex justify-between items-center ${!item.available ? 'bg-gray-50 opacity-70' : ''}">
            <div>
                <h3 class="font-bold text-gray-800">${item.name} <span class="text-xs text-gray-400">(${item.category})</span></h3>
                <p class="text-sm text-amber-600 font-semibold">&euro;${Number(item.price).toFixed(2)}</p>
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

document.getElementById("add-dish-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const menu = getMenu();

    const newItem = {
        id: Date.now(),
        name: document.getElementById("dish-name").value,
        category: document.getElementById("dish-category").value,
        price: parseFloat(document.getElementById("dish-price").value),
        image: document.getElementById("dish-image").value,
        description: document.getElementById("dish-desc").value,
        available: true
    };

    menu.push(newItem);
    saveMenu(menu);
    e.target.reset();
});

function toggleAvailability(id) {
    let menu = getMenu();
    menu = menu.map(item => item.id === id ? { ...item, available: !item.available } : item);
    saveMenu(menu);
}

function deleteItem(id) {
    if (confirm("Сигурни ли сте?")) {
        let menu = getMenu();
        menu = menu.filter(item => item.id !== id);
        saveMenu(menu);
    }
}
