export default class FoodLogPage {
  constructor(storage, onNavigate) {
    this.storage = storage;
    this.onNavigate = onNavigate;
    this.section = document.getElementById("foodlog-today-section");
    this.dateLabel = document.getElementById("foodlog-date");

    // الحدود اليومية
    this.goals = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

    this.section.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest("[data-delete]");
      if (deleteBtn) return this.removeItem(deleteBtn.dataset.delete);

      if (event.target.closest("#clear-foodlog-btn")) return this.clearAll();

      const routeBtn = event.target.closest("[data-route]");
      if (routeBtn) this.onNavigate(routeBtn.dataset.route);
    });

    // كروت الـ Quick Actions اللي تحت (Log a Meal / Scan Product)
    const quickRoutes = ["meals", "scanner"];
    document.querySelectorAll(".quick-log-btn").forEach((button, index) => {
      if (quickRoutes[index]) {
        button.addEventListener("click", () => this.onNavigate(quickRoutes[index]));
      }
    });
  }

  render() {
    this.dateLabel.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const items = this.storage.getByDate();
    const totals = this.calculateTotals(items);

    const bars = [
      { key: "calories", label: "Calories", unit: "kcal", color: "#16a34a" },
      { key: "protein", label: "Protein", unit: "g", color: "#2563eb" },
      { key: "carbs", label: "Carbs", unit: "g", color: "#d97706" },
      { key: "fat", label: "Fat", unit: "g", color: "#9333ea" },
    ]
      .map((bar) => this.progressCard(bar, totals[bar.key], this.goals[bar.key]))
      .join("");

    this.section.innerHTML = `
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        <i class="fa-solid fa-fire text-orange-500 mr-2"></i>
        Today's Nutrition
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">${bars}</div>

      <div class="border-t border-gray-200 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-700">Logged Items (${items.length})</h4>
          ${
            items.length
              ? `<button id="clear-foodlog-btn" class="text-red-500 hover:text-red-600 text-sm font-medium">
                   <i class="fa-solid fa-trash mr-1"></i>Clear All
                 </button>`
              : ""
          }
        </div>
        <div class="space-y-2">
          ${items.length ? items.map((item) => this.itemTemplate(item)).join("") : this.emptyTemplate()}
        </div>
      </div>
    `;
  }

  // ---------- Calculations ----------
  calculateTotals(items) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    items.forEach((item) => {
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.carbs += item.carbs;
      totals.fat += item.fat;
    });
    for (const key in totals) totals[key] = Math.round(totals[key]);
    return totals;
  }

  // ---------- Actions ----------
  removeItem(id) {
    this.storage.remove(id);
    this.render();
    this.toast("Item removed from log");
  }

  async clearAll() {
    const result = await Swal.fire({
      icon: "warning",
      title: "Clear today's log?",
      text: "All items logged today will be removed.",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Yes, clear all",
    });
    if (!result.isConfirmed) return;

    this.storage.clearDate();
    this.render();
    this.toast("Food log cleared");
  }

  toast(message) {
    Swal.fire({
      toast: true,
      position: "bottom-end",
      title: message,
      showConfirmButton: false,
      timer: 1800,
      background: "#3b82f6",
      color: "#ffffff",
    });
  }

  // ---------- Templates ----------
  progressCard({ label, unit, color }, total, goal) {
    const percent = Math.min(100, Math.round((total / goal) * 100));
    const tone = total > goal ? "#e11d48" : color; // أحمر لو عدّيت الحد

    return `
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">${label}</span>
          <span class="text-xs font-semibold" style="color:${tone}">${percent}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="h-2.5 rounded-full" style="width:${percent}%;background:${tone}"></div>
        </div>
        <div class="flex items-center justify-between mt-2 text-xs">
          <span class="font-bold" style="color:${tone}">${total} ${unit}</span>
          <span class="text-gray-500">/ ${goal} ${unit}</span>
        </div>
      </div>
    `;
  }

  itemTemplate(item) {
    const time = new Date(item.loggedAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const typeLabel = item.type === "product" ? "Product" : "Recipe";
    const servingsLabel = `${item.servings} ${item.servings === 1 ? "serving" : "servings"}`;

    return `
      <div class="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors">
        <img src="${item.image || ""}" alt="" class="w-12 h-12 rounded-lg object-cover bg-gray-200" />

        <div class="flex-1" style="min-width:0">
          <p class="font-semibold text-gray-900 truncate">${item.name}</p>
          <p class="text-sm text-gray-500">
            ${servingsLabel} <span class="mx-1">•</span>
            <span class="text-emerald-600 font-medium">${typeLabel}</span>
          </p>
          <p class="text-xs text-gray-400">${time}</p>
        </div>

        <div class="text-center">
          <p class="text-lg font-bold text-emerald-600">${item.calories}</p>
          <p class="text-xs text-gray-500">kcal</p>
        </div>

        <div class="hidden md:flex items-center gap-2 text-xs">
          <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded">${item.protein}g P</span>
          <span class="px-2 py-1 bg-amber-50 text-amber-700 rounded">${item.carbs}g C</span>
          <span class="px-2 py-1 bg-purple-50 text-purple-700 rounded">${item.fat}g F</span>
        </div>

        <button data-delete="${item.id}" aria-label="Remove item"
          class="text-gray-400 hover:text-red-500 transition-colors p-2">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }

  emptyTemplate() {
    return `
      <div class="text-center py-10 text-gray-500">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-utensils text-gray-400 text-2xl"></i>
        </div>
        <p class="font-medium text-gray-700">No food logged today</p>
        <p class="text-sm mb-5">Start tracking your nutrition by logging meals or scanning products</p>
        <div class="flex items-center justify-center gap-3">
          <button data-route="meals"
            class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
            <i class="fa-solid fa-plus mr-2"></i>Browse Recipes
          </button>
          <button data-route="scanner"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-barcode mr-2"></i>Scan Product
          </button>
        </div>
      </div>
    `;
  }
}