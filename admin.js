document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("restaurantName") || "Моето заведение";
    document.getElementById("restaurant-name-input").value = savedName;
    renderAdminMenu();
});

function getMenu() {
    const localData = localStorage.getItem("restaurantMenu");
    return localData ? JSON.parse(localData) : [];
}

function saveMenu(menu) {
    localStorage.setItem("restaurantMenu", JSON.stringify(menu));
    renderAdminMenu();
}

function saveRestaurantName() {
    localStorage.setItem("restaurantName", document.getElementById("restaurant-name-input").value);
    alert("Името е запазено!");
}

function generateBuiltInTemplate(type) {
    let sampleData = [];
    if (type === 'cafe') {
        localStorage.setItem("restaurantName", "Арома Кафе & Бар");
        document.getElementById("restaurant-name-input").value = "Арома Кафе & Бар";
        sampleData = [
            { id: 101, name: "Еспресо Класик", category: "Топли напитки", price: 1.80, description: "Силно и ароматно късо кафе.", image: "https://images.unsplash.com/photo-1510972527409-cac236c514f5?w=200", available: true },
            { id: 102, name: "Капучино", category: "Топли напитки", price: 2.50, description: "С гъста млечна пяна и щипка канела.", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200", available: true },
            { id: 103, name: "Домашна Лимонада", category: "Напитки", price: 3.20, description: "С пресен лимонов сок, мента и мед.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200", available: true },
            { id: 104, name: "Шоколадов Брауни", category: "Десерти", price: 3.80, description: "Топъл десерт с топка ванилов сладолед.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200", available: true }
        ];
    } else if (type === 'restaurant') {
        localStorage.setItem("restaurantName", "Ресторант 'Балкани'");
        document.getElementById("restaurant-name-input").value = "Ресторант 'Балкани'";
        sampleData = [
            { id: 201, name: "Билков Чай", category: "Топли напитки", price: 1.90, description: "Микс от планински билки с лимон.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200", available: true },
            { id: 202, name: "Шопска Салата", category: "Салати", price: 4.80, description: "Домати, краставици, пресен пипер, лук и родно сирене.", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200", available: true },
            { id: 203, name: "Пилешка Пържола", category: "Основни", price: 8.50, description: "Крехко пилешко филе на грил с гарнитура картофки.", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200", available: true }
        ];
    }
    const currentMenu = getMenu();
    saveMenu([...currentMenu, ...sampleData]);
    alert("Шаблонът е генериран успешно!");
}

function clearAllMenu() {
    if (confirm("Сигурни ли сте, че искате да изтриете абсолютно всички артикули?")) { saveMenu([]); cancelEditing(); }
}

function importFile() {
    const fileInput = document.getElementById("file-import");
    const file = fileInput.files[0];
    if (!file) { alert("Моля, първо изберете файл!"); return; }
    const reader = new FileReader();
    const fileType = file.name.split('.').pop().toLowerCase();
    reader.onload = function(e) {
        const data = e.target.result;
        let importedData = [];
        try {
            if (fileType === 'csv') {
                const text = new TextDecoder("utf-8").decode(data);
                importedData = parseCSV(text);
            } else {
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                importedData = XLSX.utils.sheet_to_json(worksheet);
            }
            processAndSaveImportedMenu(importedData);
        } catch (error) { console.error(error); alert("Грешка при четене на файла!"); }
    };
    if (fileType === 'csv') { reader.readAsArrayBuffer(file); } else { reader.readAsBinaryString(file); }
}

function parseCSV(text) {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentLine = lines[i].split(",");
        const obj = {};
        headers.forEach((header, index) => { obj[header] = currentLine[index] ? currentLine[index].trim() : ""; });
        result.push(obj);
    }
    return result;
}

function processAndSaveImportedMenu(data) {
    if (data.length === 0) { alert("Файлът е празен!"); return; }
    const currentMenu = getMenu();
    data.forEach((row, index) => {
        const name = row["Име"] || row["name"] || row["Name"];
        const category = row["Категория"] || row["category"] || row["Category"] || "Други";
        const price = parseFloat(row["Цена"] || row["price"] || row["Price"] || 0);
        const description = row["Описание"] || row["description"] || row["Description"] || "";
        const image = row["Снимка"] || row["image"] || row["Image"] || "https://via.placeholder.com/150";
        if (name) {
            currentMenu.push({ id: Date.now() + index, name: name, category: category, price: price, description: description, image: image, available: true });
        }
    });
    saveMenu(currentMenu);
    alert(`Успешно импортирахте нови артикули!`);
    document.getElementById("file-import").value = ""; 
}

function downloadTemplate() {
    const csvContent = "\ufeffИме,Категория,Цена,Описание,Снимка\nШопска Салата,Салати,4.50,Класическа рецепта,\nЕспресо,Топли напитки,1.80,Ароматно и късо,";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shablon_menu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div class="flex items-center gap-2">
                <button onclick="toggleAvailability(${item.id})" class="px-2.5 py-1 rounded text-xs font-semibold transition ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}">
                    ${item.available ? 'Налично' : 'Изчерпано'}
                </button>
                <button onclick="editItem(${item.id})" class="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded text-xs font-semibold transition">
                    Редактирай
                </button>
                <button onclick="deleteItem(${item.id})" class="bg-gray-100 text-gray-500 hover:text-red-600 p-1.5 rounded text-xs">Изтрий</button>
            </div>
        </div>
    `).join("");
}

// НУЖНО СЪБИТИЕ: Обработва както Добавяне, така и Редактиране
document.getElementById("add-dish-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const menu = getMenu();
    const editId = document.getElementById("edit-item-id").value;

    const dishData = {
        name: document.getElementById("dish-name").value,
        category: document.getElementById("dish-category").value,
        price: parseFloat(document.getElementById("dish-price").value),
        image: document.getElementById("dish-image").value,
        description: document.getElementById("dish-desc").value
    };

    if (editId) {
        // Режим Редактиране: Намираме стария елемент и го обновяваме запазвайки ID и наличност
        const updatedMenu = menu.map(item => {
            if (item.id == editId) {
                return { ...item, ...dishData };
            }
            return item;
        });
        saveMenu(updatedMenu);
        cancelEditing(); // Връщаме формата в начално състояние
    } else {
        // Режим Добавяне
        menu.push({
            id: Date.now(),
            ...dishData,
            available: true
        });
        saveMenu(menu);
        e.target.reset();
    }
});

// НОВА ФУНКЦИЯ: Качва данните от списъка горе във формата за редакция
function editItem(id) {
    const menu = getMenu();
    const item = menu.find(i => i.id === id);
    if (!item) return;

    // Попълваме стойностите във формата
    document.getElementById("edit-item-id").value = item.id;
    document.getElementById("dish-name").value = item.name;
    document.getElementById("dish-category").value = item.category;
    document.getElementById("dish-price").value = item.price;
    document.getElementById("dish-image").value = item.image;
    document.getElementById("dish-desc").value = item.description;

    // Сменяме текстовете на формата и показваме бутона за отказ
    document.getElementById("form-title").innerText = "Редактирай артикул";
    document.getElementById("submit-btn").innerText = "Запази промените";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    // Скролваме леко нагоре до формата, за да види потребителят какво прави
    document.getElementById("add-dish-form").scrollIntoView({ behavior: 'smooth' });
}

// НОВА ФУНКЦИЯ: Спира редактирането и нулира формата на чисто
function cancelEditing() {
    document.getElementById("edit-item-id").value = "";
    document.getElementById("add-dish-form").reset();
    document.getElementById("dish-image").value = "https://via.placeholder.com/150"; // Стойност по подразбиране
    
    document.getElementById("form-title").innerText = "Добави артикул ръчно";
    document.getElementById("submit-btn").innerText = "Добави в менюто";
    document.getElementById("cancel-edit-btn").classList.add("hidden");
}

function toggleAvailability(id) {
    let menu = getMenu();
    menu = menu.map(item => item.id === id ? { ...item, available: !item.available } : item);
    saveMenu(menu);
}

function deleteItem(id) {
    if (confirm("Изтриване?")) {
        saveMenu(getMenu().filter(item => item.id !== id));
        // Ако сме изтрили артикула, който редактираме в момента, затваряме режима за редакция
        if (document.getElementById("edit-item-id").value == id) { cancelEditing(); }
    }
}
