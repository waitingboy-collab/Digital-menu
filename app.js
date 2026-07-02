// КОНФИГУРАЦИЯ НА SUPABASE
const SUPABASE_URL = "https://rhqirgmxfaeqsihuvqym.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocWlyZ214ZmFlcXNpaHV2cXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTUwOTQsImV4cCI6MjA5ODU3MTA5NH0.ua9LKCdXgTP9cp48t_DGmHyixBqk4F0dJf424B20vec";

// Инициализираме клиента с различно име на променливата (supabaseClient), за да няма конфликт
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Проверяваме езика на телефона на клиента при отваряне
let currentLang = navigator.language.startsWith('en') ? 'EN' : 'BG';

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    
    // Автоматично стартиране на английски, ако езикът на телефона е такъв
    if (currentLang === 'EN') {
        setTimeout(() => {
            triggerGoogleTranslate('en');
            document.getElementById("lang-text").innerText = "BG";
        }, 1200);
    }
});

// АСИНХРОННО ИЗВЛИЧАНЕ НА ДАННИТЕ ОТ SUPABASE
async function initMenu() {
    const container = document.getElementById("menu-container");
    
    // Задаваме заглавие на ресторанта
    document.getElementById("restaurant-title").innerText = "Ресторант 'Балкани'";

    try {
        // Използваме новото име supabaseClient за заявката
        let { data: menuItems, error } = await supabaseClient
            .from('menu_items')
            .select('*');

        if (error) throw error;

        // Ако таблицата е напълно празна в Supabase
        if (!menuItems || menuItems.length === 0) {
            container.innerHTML = `<div class="text-center py-12 text-gray-400 text-sm">📢 Менюто е празно. Добавете ястия от Supabase!</div>`;
            return;
        }

        // Филтрираме само наличните ястия
        const availableItems = menuItems.filter(item => item.available !== false);
        
        if (availableItems.length === 0) {
            container.innerHTML = `<div class="text-center py-12 text-gray-400 text-sm">📢 В момента няма налични ястия.</div>`;
            return;
        }

        // Извличане на уникалните категории
        const categories = [...new Set(availableItems.map(item => item.category))];

        renderCategoriesNav(categories);
        renderMenuContent(availableItems, categories);

    } catch (error) {
        console.error("Грешка при връзка със Supabase:", error);
        container.innerHTML = `<div class="text-center py-12 text-red-500 text-sm">📢 Грешка при зареждане на менюто. Моля, опитайте отново.</div>`;
    }
}

function renderCategoriesNav(categories) {
    const nav = document.getElementById("categories-nav");
    let html = `
        <button onclick="scrollToCategory('all')" class="category-btn bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition whitespace-nowrap cursor-pointer">Всички</button>
    `;
    categories.forEach(cat => {
        html += `
            <button onclick="scrollToCategory('${cat}')" class="category-btn bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap cursor-pointer">${cat}</button>
        `;
    });
    nav.innerHTML = html;
}

function renderMenuContent(items, categories) {
    const container = document.getElementById("menu-container");
    let html = "";

    categories.forEach(category => {
        const categoryItems = items.filter(item => item.category === category);
        html += `
            <section id="sec-${category}" class="space-y-3 scroll-mt-24">
                <h2 class="text-sm font-black text-gray-400 uppercase tracking-wider pl-1 border-l-3 border-amber-600">${category}</h2>
                <div class="space-y-3">
        `;
        categoryItems.forEach(item => {
            const defaultImg = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop"; // Готино дефолтно кафе
            const itemImg = item.image && item.image.trim() !== "" ? item.image : defaultImg;
            html += `
                <div class="bg-white p-3 rounded-2xl shadow-xs border border-gray-100 flex gap-3 items-center">
                    <img src="${itemImg}" alt="${item.name}" class="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0" onerror="this.src='${defaultImg}'">
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="font-bold text-gray-800 text-sm truncate">${item.name}</h3>
                            <span class="text-amber-600 font-extrabold text-sm flex-shrink-0">${Number(item.price).toFixed(2)} лв.</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.description || ''}</p>
                        <div class="mt-2">
                            <span class="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Налично
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div></section>`;
    });
    container.innerHTML = html;
}

// ПРИНУДИТЕЛНО СТАРТИРАНЕ НА ПРЕВОДА НА GOOGLE
function triggerGoogleTranslate(langCode) {
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
        selectEl.value = langCode;
        if (document.createEvent) {
            const event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, true);
            selectEl.dispatchEvent(event);
        } else {
            const event = document.createEventObject();
            event.eventType = 'change';
            selectEl.fireEvent('onchange', event);
        }
    }
}

// РЪЧНО СМЕНЯНЕ НА ЕЗИКА ОТ БУТОНА
function toggleGoogleLanguage() {
    const langText = document.getElementById("lang-text");
    if (currentLang === 'BG') {
        currentLang = 'EN';
        langText.innerText = "BG";
        triggerGoogleTranslate('en');
    } else {
        currentLang = 'BG';
        langText.innerText = "EN";
        triggerGoogleTranslate('bg');
    }
}

function scrollToCategory(categoryName) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("bg-amber-600", "text-white", "font-bold");
        btn.classList.add("bg-gray-100", "text-gray-600", "font-semibold");
    });
    
    // Подсигуряване на event обекта при клик
    if (window.event) {
        const clickedBtn = window.event.currentTarget;
        if (clickedBtn && clickedBtn.classList) {
            clickedBtn.classList.remove("bg-gray-100", "text-gray-600", "font-semibold");
            clickedBtn.classList.add("bg-amber-600", "text-white", "font-bold");
        }
    }

    if (categoryName === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const element = document.getElementById(`sec-${categoryName}`);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
}
