function processAndSaveImportedMenu(data) {
    if (data.length === 0) {
        alert("Файлът е празен!");
        return;
    }

    const currentMenu = getMenu();
    let addedCount = 0;

    data.forEach((row, index) => {
        // 1. Търсим името на артикула под различни възможни заглавия
        const name = row["Име"] || row["name"] || row["Name"] || row["Наименование"] || row["Продукт"];
        
        // 2. Търсим категорията
        const category = row["Категория"] || row["category"] || row["Category"] || "Топли напитки";
        
        // 3. Търсим и почистваме цената (сменяме запетаите с точки и махаме текст като "лв" или "€")
        let rawPrice = row["Цена"] || row["price"] || row["Price"] || "0";
        if (typeof rawPrice === "string") {
            rawPrice = rawPrice.replace(",", ".").replace(/[^0-9.]/g, "");
        }
        const price = parseFloat(rawPrice) || 0;
        
        // 4. Търсим описание и снимка
        const description = row["Описание"] || row["description"] || row["Description"] || "";
        const image = row["Снимка"] || row["image"] || row["Image"] || "https://via.placeholder.com/150";

        // Проверяваме дали редът има поне име, за да го добавим
        if (name && name.toString().trim() !== "") {
            currentMenu.push({
                id: Date.now() + index,
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
        alert(`Успешно импортирахте ${addedCount} нови артикула!`);
        document.getElementById("file-import").value = ""; // Нулираме избора на файл
    } else {
        alert("Не бяха намерени валидни артикули. Проверете дали най-горният ред в Excel съдържа заглавия като: Име, Категория, Цена.");
    }
}
