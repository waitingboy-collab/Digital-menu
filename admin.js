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

// Първоначален импорт от Excel / CSV
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
        } catch (error) {
            console.error(error);
            alert("Грешка при четене на файла! Проверете дали структурата му е правилна.");
        }
    };

    if (fileType === 'csv') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

function parseCSV(text) {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentLine = lines[i].split(",");
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = currentLine[index] ? currentLine[index].trim() : "";
        });
        result.push(obj);
    }
    return result;
}

function processAndSaveImportedMenu(data) {
    if (data.length === 0) {
        alert("Файлът е празен!");
        return;
    }

    const currentMenu = getMenu();

    data.forEach((row, index) => {
        const name = row["Име"] || row["name"] || row["Name"];
        const category = row["Категория"] || row["category"] || row["Category"] || "Други";
        const price = parseFloat(row["Цена"] || row["price"] || row["Price"] || 0);
        const description = row["Описание"] || row["description"] || row["Description"] || "";
        const image = row["Снимка"] || row["image"] || row["Image"] || "https://via.placeholder.com/150";

        if (name) {
            currentMenu.push({
                id: Date.now() + index,
                name: name,
                category: category,
                price: price,
                description: description,
                image: image,
                available: true
            });
        }
    });

    saveMenu(currentMenu);
    alert(`Успешно импортирахте нови артикули във вашето меню!`);
    document.getElementById("file-import").value = ""; 
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
