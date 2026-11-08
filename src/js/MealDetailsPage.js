import { loadingSpinner } from "./components.js";
import ServingsModal from "./ServingsModal.js";

export default class MealDetailsPage {
  constructor(api, onBack, storage) {
    this.api = api;
    this.onBack = onBack;
    this.storage = storage;
    this.modal = new ServingsModal();
    this.section = document.getElementById("meal-details");
    this.meal = null;
    this.nutrition = null;
    this.dailyValues = { protein: 50, carbs: 300, fat: 65, fiber: 28, sugar: 50 };

    this.section.addEventListener("click", (event) => {
      if (event.target.closest("#back-to-meals-btn")) this.onBack();
      if (event.target.closest("#log-meal-btn")) this.logMeal();
    });
  }

  render(meal) {
    this.meal = meal;
    this.nutrition = null;

    this.section.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn"
          class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Recipes</span>
        </button>

        ${this.heroTemplate(meal)}

        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" data-meal-id="${meal.id}"
            class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Log This Meal</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            ${this.ingredientsTemplate(meal)}
            ${this.instructionsTemplate(meal)}
            ${this.videoTemplate(meal)}
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                Nutrition Facts
              </h2>
              <div id="nutrition-facts-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadNutrition(meal);
  }

  // ---------- Nutrition ----------
  async loadNutrition(meal) {
    const container = document.getElementById("nutrition-facts-container");
    container.innerHTML = loadingSpinner();

    const ingredients = meal.ingredients.map((item) =>
      `${item.measure} ${item.ingredient}`.trim()
    );

    try {
      const response = await this.api.analyzeNutrition(meal.name, ingredients);
      if (this.meal !== meal) return; // المستخدم فتح وجبة تانية
      this.nutrition = response.data;
      this.renderNutrition(response.data);
    } catch (error) {
      if (this.meal !== meal) return;
      container.innerHTML = `
        <p class="text-sm text-red-500">Nutrition data is unavailable for this meal.</p>
        <p class="text-xs text-gray-400 mt-1">${error.message}</p>
      `;
    }
  }

  renderNutrition(data) {
    const { perServing, totals, servings } = data;
    const container = document.getElementById("nutrition-facts-container");

    const rows = [
      { label: "Protein", key: "protein", color: "emerald" },
      { label: "Carbs", key: "carbs", color: "blue" },
      { label: "Fat", key: "fat", color: "purple" },
      { label: "Fiber", key: "fiber", color: "orange" },
      { label: "Sugar", key: "sugar", color: "pink" },
    ]
      .map(({ label, key, color }) => {
        const value = Math.round(perServing[key]);
        const percent = Math.min(100, (perServing[key] / this.dailyValues[key]) * 100);
        return `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-${color}-500"></div>
              <span class="text-gray-700">${label}</span>
            </div>
            <span class="font-bold text-gray-900">${value}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-${color}-500 h-2 rounded-full" style="width: ${percent}%"></div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `
      <p class="text-sm text-gray-500 mb-4">Per serving</p>
      <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p class="text-4xl font-bold text-emerald-600">${Math.round(perServing.calories)}</p>
        <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(totals.calories)} cal</p>
      </div>
      <div class="space-y-4">${rows}</div>
    `;

    document.getElementById("hero-servings").textContent = `${servings} servings`;
    document.getElementById("hero-calories").textContent =
      `${Math.round(perServing.calories)} cal/serving`;
  }

  // ---------- Log ----------
  async logMeal() {
    if (!this.nutrition) {
      Swal.fire({
        icon: "info",
        title: "Nutrition data not ready",
        text: "Please wait until the nutrition facts finish loading.",
      });
      return;
    }

    const perServing = this.nutrition.perServing;

    const servings = await this.modal.open({
      title: this.meal.name,
      image: this.meal.thumbnail,
      nutrition: perServing,
    });
    if (!servings) return; // اتلغى

    const calories = Math.round(perServing.calories * servings);

    this.storage.add({
      type: "meal",
      name: this.meal.name,
      image: this.meal.thumbnail,
      servings,
      calories,
      protein: Math.round(perServing.protein * servings),
      carbs: Math.round(perServing.carbs * servings),
      fat: Math.round(perServing.fat * servings),
    });

    Swal.fire({
      icon: "success",
      title: "Meal Logged!",
      html: `
        <p>${this.meal.name} (${servings} ${servings === 1 ? "serving" : "servings"}) has been added to your daily log.</p>
        <p style="color:#16a34a;font-weight:600;margin-top:.5rem">+${calories} calories</p>
      `,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  // ---------- Templates ----------
  heroTemplate(meal) {
    const areaBadge = meal.area
      ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>`
      : "";
    const tagBadge = meal.tags?.[0]
      ? `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${meal.tags[0]}</span>`
      : "";

    return `
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img src="${meal.thumbnail}" alt="${meal.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex items-center gap-3 mb-3">
              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>
              ${areaBadge}
              ${tagBadge}
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.name}</h1>
            <div class="flex items-center gap-6 text-white/90">
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-clock"></i>
                <span>30 min</span>
              </span>
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-utensils"></i>
                <span id="hero-servings">— servings</span>
              </span>
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-fire"></i>
                <span id="hero-calories">— cal/serving</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  ingredientsTemplate(meal) {
    const items = meal.ingredients
      .map(
        (item) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
          <span class="text-gray-700">
            <span class="font-medium text-gray-900">${item.measure}</span> ${item.ingredient}
          </span>
        </div>`
      )
      .join("");

    return `
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-emerald-600"></i>
          Ingredients
          <span class="text-sm font-normal text-gray-500 ml-auto">${meal.ingredients.length} items</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${items}</div>
      </div>
    `;
  }

  instructionsTemplate(meal) {
    const steps = Array.isArray(meal.instructions)
      ? meal.instructions
      : [meal.instructions].filter(Boolean);

    const items = steps
      .map(
        (step, index) => `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
          <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
        </div>`
      )
      .join("");

    return `
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
          Instructions
        </h2>
        <div class="space-y-4">${items}</div>
      </div>
    `;
  }

  videoTemplate(meal) {
    const embedUrl = this.getEmbedUrl(meal.youtube);
    if (!embedUrl) return ""; // مفيش فيديو → منعرضش القسم

    return `
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-video text-red-500"></i>
          Video Tutorial
        </h2>
        <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
          <iframe src="${embedUrl}" class="absolute inset-0 w-full h-full"
            frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  getEmbedUrl(url) {
    if (!url) return "";
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  }
}