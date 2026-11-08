    export default class ServingsModal {
  open({ title, image = "", nutrition }) {
    return new Promise((resolve) => {
      let servings = 1;

      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:1rem;";

      overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-6" style="width:100%;max-width:32rem;">
          <div class="flex items-center gap-4 mb-5">
            ${image ? `<img src="${image}" alt="" class="w-16 h-16 rounded-xl object-cover" />` : ""}
            <div>
              <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
              <p class="text-sm text-gray-500">${title}</p>
            </div>
          </div>

          <p class="text-sm font-semibold text-gray-700 mb-2">Number of Servings</p>
          <div class="flex items-center gap-3 mb-5">
            <button type="button" data-action="minus"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">
              <i class="fa-solid fa-minus"></i>
            </button>
            <input type="number" min="0.5" step="0.5" value="1" data-role="input"
              class="text-center text-lg font-bold border border-gray-300 rounded-lg py-2"
              style="width:6rem;" />
            <button type="button" data-action="plus"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

          <div class="bg-emerald-50 rounded-xl p-4 mb-6">
            <p class="text-sm text-gray-600 mb-3">Estimated nutrition per serving:</p>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div>
                <p class="text-lg font-bold" style="color:#16a34a">${Math.round(nutrition.calories)}</p>
                <p class="text-xs text-gray-500">Calories</p>
              </div>
              <div>
                <p class="text-lg font-bold" style="color:#2563eb">${Math.round(nutrition.protein)}g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>
              <div>
                <p class="text-lg font-bold" style="color:#d97706">${Math.round(nutrition.carbs)}g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>
              <div>
                <p class="text-lg font-bold" style="color:#9333ea">${Math.round(nutrition.fat)}g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button type="button" data-action="cancel"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">
              Cancel
            </button>
            <button type="button" data-action="confirm"
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
              <i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal
            </button>
          </div>
        </div>
      `;

      const input = overlay.querySelector('[data-role="input"]');

      const close = (result) => {
        document.removeEventListener("keydown", onKeyDown);
        overlay.remove();
        resolve(result);
      };

      const onKeyDown = (event) => {
        if (event.key === "Escape") close(null);
      };

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) return close(null); // الضغط على الخلفية

        const action = event.target.closest("[data-action]")?.dataset.action;
        if (action === "cancel") close(null);
        if (action === "confirm" && servings > 0) close(servings);
        if (action === "minus" || action === "plus") {
          servings = Math.max(0.5, servings + (action === "plus" ? 0.5 : -0.5));
          input.value = servings;
        }
      });

      input.addEventListener("input", () => {
        const value = parseFloat(input.value);
        if (value > 0) servings = value;
      });

      document.addEventListener("keydown", onKeyDown);
      document.body.appendChild(overlay);
    });
  }
}