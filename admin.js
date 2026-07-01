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

// Модернизирана и сигурна функция за импорт на Excel / CSV
function importFile() {
    const fileInput = document.getElementById("file-import");
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Моля, първо изберете файл!");
        return;
    }

    const reader = new FileReader();
    const fileType = file.name.split('.').pop().toLowerCase();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            let importedData = [];

            if (fileType === 'csv') {
                // Декодираме CSV текста на български (UTF-8)
                const decoder = new TextDecoder("utf-8");
                const text = decoder.decode(data);
                importedData = parseCSV(text);
            } else {
                // Четем Excel (.xlsx / .xls) от масива с байтове
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                importedData = XLSX.utils.sheet_to_json(worksheet);
            }

            processAndSaveImportedMenu(importedData);
        } catch (error) {
            console.error("Грешка при обработка на файла:", error);
            alert("Възникна грешка при четенето на файла. Уверете се, че не е повреден.");
        }
    };

    // Четем файла като ArrayBuffer - работи безотказно за всички формати
    reader.readAsArrayBuffer(file);
}

// Защитен парсер за CSV формати
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Разделяне по запетая, като изчистваме кавичките, ако има такива
        const currentLine = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = currentLine[index] !== undefined ? currentLine[index] : "";
        });
        result.push(obj);
    }
    return result;
}

// Интелигентна обработка на колоните от Excel/CSV таблицата
function processAndSaveImportedMenu(data) {
    if (!data || data.length === 0) {
        alert("Файлът е празен или няма разпознаваеми редове!");
        return;
    }

    const currentMenu = getMenu();
    let addedCount = 0;

    data.forEach((row, index) => {
        // Проверка за заглавието на колоната "Име"
        const name = row["Име"] || row["name"] || row["Name"] || row["Наименование"] || row["Продукт"];
        
        // Категория по подразбиране, ако липсва
        const category = row["Категория"] || row["category"] || row["Category"] || "Топли напитки";
        
        // Форматиране и изчистване на цената
        let rawPrice = row["Цена"] || row["price"] || row["Price"] || "0";
        if (typeof rawPrice === "string") {
            rawPrice = rawPrice.replace(",", ".").replace(/[^0-9.]/g, "");
        }
        const price = parseFloat(rawPrice) || 0;
        
        const description = row["Описание"] || row["description"] || row["Description"] || "";
        const image = row["Снимка"] || row["image"] || row["Image"] || "https://via.placeholder.com/150";

        if (name && name.toString().trim() !== "") {
            currentMenu.push({
                id: Date.now() + index + Math.floor(Math.random() * 1000),
                name: name.toString().trim(),
                category: category.toString().trim(),
                price: price,
                description: description.toString().trim(),
                image: image.toString().trim(),
                available: true
            });
            addedCount++;
        }
    });

    if (addedCount > 0) {
        saveMenu(currentMenu);
        alert(`Успешно добавихте ${addedCount} артикула в менюто!`);
        document.getElementById("file-import").value = ""; // Изчистване на бутона
    } else {
        alert("Не бяха намерени съвпадащи данни. Проверете дали първият ред (заглавният) съдържа: Име, Категория, Цена");
    }
}

function downloadTemplate() {
    const csvContent = "data:text/csv;charset=utf-8,Име,Категория,Цена,Описание,Снимка\nШопска Салата,Салати,4.50,Класическа рецепта,\nЕспресо,Топли напитки,1.80,Ароматно и късо,";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
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
            <div class="flex items-center gap-3">
                <button onclick="toggleAvailability(${item.id})" class="px-3 py-1 rounded text-xs font-semibold transition ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}">
                    ${item.available ? 'Налично' : 'Изчерпано'}
                </button>
                <button onclick="deleteItem(${item.id})" class="bg-gray-100 text-gray-500 hover:text-red-600 p-2 rounded">Изтрий</button>
            </div>
        </div>
    `).join("");
}

document.getElementById("add-dish-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const menu = getMenu();
    menu.push({
        id: Date.now(),
        name: document.getElementById("dish-name").value,
        category: document.getElementById("dish-category").value,
        price: parseFloat(document.getElementById("dish-price").value),
        image: document.getElementById("dish-image").value,
        description: document.getElementById("dish-desc").value,
        available: true
    });
    saveMenu(menu);
    e.target.reset();
});

function toggleAvailability(id) {
    let menu = getMenu();
    menu = menu.map(item => item.id === id ? { ...item, available: !item.available } : item);
    saveMenu(menu);
}

function deleteItem(id) {
    if (confirm("Изтриване?")) {
        saveMenu(getMenu().filter(item => item.id !== id));
    }
}
