// КОНФИГУРАЦИЯ НА SUPABASE (Същата като в app.js)
const SUPABASE_URL = "https://rhqirgmxfaeqsihuvqym.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocWlyZ214ZmFlcXNpaHV2cXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTUwOTQsImV4cCI6MjA5ODU3MTA5NH0.ua9LKCdXgTP9cp48t_DGmHyixBqk4F0dJf424B20vec";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async () => {
    // Проверяваме дали има вече логнат сесиен потребител
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        showDashboard();
    } else {
        showLogin();
    }

    // Слушатели за събития (Events)
    document.getElementById("login-btn").addEventListener("click", handleLogin);
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
    document.getElementById("add-item-form").addEventListener("submit", handleAddItem);
});

// ФУНКЦИЯ ЗА ВХОД (AUTH LOGIN)
async function handleLogin() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorEl = document.getElementById("login-error");

    if (!email || !password) {
        errorEl.innerText = "Моля, попълнете всички полета.";
        errorEl.classList.remove("hidden");
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        showDashboard();
    } {
        errorEl.innerText = "Грешен имейл или парола!";
        errorEl.classList.remove("hidden");
        console.error(error);
    }
}

// ИЗХОД ОТ СИСТЕМАТА
async function handleLogout() {
    await supabaseClient.auth.signOut();
    showLogin();
}

// ПРЕВКЛЮЧВАНЕ НА ИНТЕРФЕЙСИТЕ
function showDashboard() {
    document.getElementById("login-card").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    document.getElementById("logout-btn").classList.remove("hidden");
    loadAdminMenu();
}

function showLogin() {
    document.getElementById("login-card").classList.remove("hidden");
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("logout-btn").classList.add("hidden");
    document.getElementById("login-password").value = "";
}

// ЗАРЕЖДАНЕ НА ТАБЛИЦАТА С АРТИКУЛИ
async function loadAdminMenu() {
    const tableBody = document.getElementById("admin-items-table");
    
    try {
        let { data: items, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true });

        if (error) throw error;

        document.getElementById("items-count").innerText = `${items.length} позиции`;
        
        if (items.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400">Няма добавени артикули.</td></tr>`;
            return;
        }

        let html = "";
        items.forEach(item => {
            html += `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 font-bold text-slate-800">${item.name}</td>
                    <td class="p-3 text-gray-500 text-xs">${item.category}</td>
                    <td class="p-3 font-semibold text-amber-600">€${Number(item.price).toFixed(2)}</td>
                    <td class="p-3 text-center">
                        <button onclick="toggleAvailability('${item.id}', ${item.available})" class="cursor-pointer inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${item.available !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}">
                            <span class="w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'}"></span>
                            ${item.available !== false ? 'Налично' : 'Свършило'}
                        </button>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="deleteItem('${item.id}')" class="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg border border-red-100 hover:bg-red-50 transition cursor-pointer">
                            🗑️ Изтрий
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

    } catch (error) {
        console.error("Грешка при зареждане на мениджъра:", error);
    }
}

// ДОБАВЯНЕ НА НОВО ЯСТИЕ / НАПИТКА
async function handleAddItem(e) {
    e.preventDefault();

    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value.trim();
    const price = parseFloat(document.getElementById("item-price").value);
    const description = document.getElementById("item-desc").value.trim();
    const image = document.getElementById("item-image").value.trim();

    try {
        const { error } = await supabaseClient
            .from('menu_items')
            .insert([{ name, category, price, description, image, available: true }]);

        if (error) throw error;

        document.getElementById("add-item-form").reset();
        loadAdminMenu(); // Презареждаме таблицата веднага
    } catch (error) {
        alert("Грешка при добавяне: Уверете се, че сте логнати или проверете правилата за сигурност.");
        console.error(error);
    }
}

// ВКЛЮЧВАНЕ / ИЗКЛЮЧВАНЕ НА НАЛИЧНОСТ БЪРЗО ОТ ТАБЛИЦАТА
async function toggleAvailability(id, currentStatus) {
    try {
        const { error } = await supabaseClient
            .from('menu_items')
            .update({ available: !currentStatus })
            .eq('id', id);

        if (error) throw error;
        loadAdminMenu();
    } catch (error) {
        console.error(error);
    }
}

// ИЗТРИВАНЕ НА АРТИКУЛ
async function deleteItem(id) {
    if (!confirm("Сигурни ли сте, че искате да изтриете този артикул от менюто?")) return;

    try {
        const { error } = await supabaseClient
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        loadAdminMenu();
    } catch (error) {
        console.error(error);
    }
}
