const SUPABASE_URL = "https://rhqirgmxfaeqsihuvqym.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocWlyZ214ZmFlcXNpaHV2cXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTUwOTQsImV4cCI6MjA5ODU3MTA5NH0.ua9LKCdXgTP9cp48t_DGmHyixBqk4F0dJf424B20vec";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let localItemsArray = []; 

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        showDashboard();
    } else {
        showLogin();
    }

    document.getElementById("login-btn").addEventListener("click", handleLogin);
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
    document.getElementById("add-item-form").addEventListener("submit", handleFormSubmit);
    document.getElementById("save-res-name-btn").addEventListener("click", saveRestaurantName);
});

function loadRestaurantName() {
    const savedName = localStorage.getItem("customRestaurantName") || "Ресторант 'Балкани'";
    document.getElementById("restaurant-name-input").value = savedName;
}

function saveRestaurantName() {
    const nameInput = document.getElementById("restaurant-name-input").value.trim();
    if(nameInput) {
        localStorage.setItem("customRestaurantName", nameInput);
        alert("Името на заведението е записано успешно!");
    }
}

async function handleLogin() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorEl = document.getElementById("login-error");

    errorEl.classList.add("hidden");

    if (!email || !password) {
        errorEl.innerText = "Моля, попълнете всички полета.";
        errorEl.classList.remove("hidden");
        return;
    }

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showDashboard();
    } catch (error) {
        errorEl.innerText = "Грешен имейл или парола!";
        errorEl.classList.remove("hidden");
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    showLogin();
}

function showDashboard() {
    document.getElementById("login-card").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    document.getElementById("logout-btn").classList.remove("hidden");
    loadRestaurantName();
    loadAdminMenu();
}

function showLogin() {
    document.getElementById("login-card").classList.remove("hidden");
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("logout-btn").classList.add("hidden");
    document.getElementById("login-password").value = "";
}

async function loadAdminMenu() {
    const tableBody = document.getElementById("admin-items-table");
    
    try {
        let { data: items, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true });

        if (error) throw error;

        localItemsArray = items; 
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
                        <button onclick="window.toggleAvailability('${item.id}', ${item.available})" class="cursor-pointer inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${item.available !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}">
                            <span class="w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'}"></span>
                            ${item.available !== false ? 'Налично' : 'Свършило'}
                        </button>
                    </td>
                    <td class="p-3 text-right space-x-1">
                        <button onclick="window.startEditItem('${item.id}')" class="text-xs font-bold text-amber-600 hover:text-amber-700 px-2 py-1 rounded-lg border border-amber-100 hover:bg-amber-50 transition cursor-pointer">
                            ✏️ Редактирай
                        </button>
                        <button onclick="window.deleteItem('${item.id}')" class="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg border border-red-100 hover:bg-red-50 transition cursor-pointer">
                            🗑️ Изтрий
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

    } catch (error) {
        console.error(error);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("item-id").value;
    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value.trim();
    const price = parseFloat(document.getElementById("item-price").value);
    const description = document.getElementById("item-desc").value.trim();
    const image = document.getElementById("item-image").value.trim();

    try {
        if (id) {
            const { error } = await supabaseClient
                .from('menu_items')
                .update({ name, category, price, description, image })
                .eq('id', id);

            if (error) throw error;
            alert("Артикулът е редактиран успешно!");
        } else {
            const { error } = await supabaseClient
                .from('menu_items')
                .insert([{ name, category, price, description, image, available: true }]);

            if (error) throw error;
            alert("Артикулът е добавен успешно!");
        }

        resetForm();
        loadAdminMenu();
    } catch (error) {
        alert("Грешка при запис на данните.");
        console.error(error);
    }
}

// ГЛОБАЛНА ФУНКЦИЯ ЗА РЕДАКТИРАНЕ
window.startEditItem = function(id) {
    const item = localItemsArray.find(i => i.id === id);
    if (!item) return;

    document.getElementById("item-id").value = item.id;
    document.getElementById("item-name").value = item.name;
    document.getElementById("item-category").value = item.category;
    document.getElementById("item-price").value = item.price;
    document.getElementById("item-desc").value = item.description || "";
    document.getElementById("item-image").value = item.image || "";

    document.getElementById("form-title").innerText = "✏️ Редактиране на артикул";
    document.getElementById("submit-form-btn").innerText = "💾 Запази промените";
    document.getElementById("submit-form-btn").classList.replace("bg-green-600", "bg-amber-600");
    document.getElementById("submit-form-btn").classList.replace("hover:bg-green-700", "hover:bg-amber-700");
    
    document.getElementById("form-title").scrollIntoView({ behavior: 'smooth' });
};

// ГЛОБАЛНА ФУНКЦИЯ ЗА НАЛИЧНОСТ
window.toggleAvailability = async function(id, currentStatus) {
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
};

// ГЛОБАЛНА ФУНКЦИЯ ЗА ИЗТРИВАНЕ
window.deleteItem = async function(id) {
    if (!confirm("Сигурни ли сте, че искате да изтриете този артикул?")) return;

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
};

function resetForm() {
    document.getElementById("add-item-form").reset();
    document.getElementById("item-id").value = "";
    document.getElementById("form-title").innerText = "Добавяне на нов артикул";
    document.getElementById("submit-form-btn").innerText = "➕ Добави към менюто";
    document.getElementById("submit-form-btn").classList.replace("bg-amber-600", "bg-green-600");
    document.getElementById("submit-form-btn").classList.replace("hover:bg-amber-700", "hover:bg-green-700");
}
