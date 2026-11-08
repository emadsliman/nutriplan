import { loadingSpinner, emptyState, getCategoryStyle } from "./components.js";

export default class HomePage {
  constructor(api, onMealSelect) {
    this.api = api;
    this.onMealSelect = onMealSelect;
    this.meals = [];
    this.grid = document.getElementById("recipes-grid");
    this.count = document.getElementById("recipes-count");
    this.categoriesGrid = document.getElementById("categories-grid");
    this.areasBar = document.querySelector(
      "#search-filters-section .overflow-x-auto"
    );

    this.categories = [];
    this.areas = [];
    this.activeCategory = "";
    this.activeArea = "";

    this.popularAreas = [
      "Egyptian", "Italian", "American", "British", "French",
      "Indian", "Japanese", "Mexican", "Chinese", "Turkish",
    ];
  }

  async init() {
    this.bindEvents();

    const [categories, areas] = await Promise.all([
      this.api.getCategories(),
      this.api.getAreas(),
    ]);
    this.categories = categories.results;
    this.areas = areas.filter((name) => this.popularAreas.includes(name));

    this.renderFilters();
    await this.loadMeals();
  }

  // ---------- Events ----------
  bindEvents() {
    this.categoriesGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".category-card");
      if (card) this.selectCategory(card.dataset.category);
    });

    this.areasBar.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const area = button.dataset.area;
      if (area === "") this.showAll();
      else this.selectArea(area);
    });

    this.grid.addEventListener("click", (event) => {
      const card = event.target.closest(".recipe-card");
      if (!card) return;
      const meal = this.meals.find((m) => String(m.id) === card.dataset.mealId);
      if (meal) this.onMealSelect(meal);
    });
  }

  selectCategory(name) {
    this.activeCategory = this.activeCategory === name ? "" : name;
    this.activeArea = "";
    this.refresh();
  }

  selectArea(name) {
    this.activeArea = this.activeArea === name ? "" : name;
    this.activeCategory = "";
    this.refresh();
  }

  showAll() {
    this.activeCategory = "";
    this.activeArea = "";
    this.refresh();
  }

  refresh() {
    this.renderFilters();
    this.loadMeals();
  }

  // ---------- Data ----------
  async loadMeals() {
    this.grid.innerHTML = loadingSpinner();

    try {
      const hasFilter = this.activeCategory || this.activeArea;
      const data = hasFilter
        ? await this.api.filterMeals({
            category: this.activeCategory,
            area: this.activeArea,
          })
        : await this.api.getMeals(25);

      this.renderMeals(data.results);
    } catch (error) {
      console.error(error);
      this.grid.innerHTML = emptyState(
        "Something went wrong",
        "Please try again in a moment"
      );
    }
  }

  // ---------- Rendering ----------
  renderFilters() {
    this.categoriesGrid.innerHTML = this.categories
      .map((category) => this.createCategoryCard(category))
      .join("");

    const noFilter = !this.activeCategory && !this.activeArea;
    this.areasBar.innerHTML =
      this.createAreaButton("All Recipes", "", noFilter) +
      this.areas
        .map((area) =>
          this.createAreaButton(area, area, this.activeArea === area)
        )
        .join("");
  }

  renderMeals(meals) {
    this.meals = meals;
    if (meals.length === 0) {
      this.grid.innerHTML = emptyState();
    } else {
      this.grid.innerHTML = meals.map((meal) => this.createCard(meal)).join("");
    }
    this.count.textContent = `Showing ${meals.length} recipes`;
  }

  createAreaButton(label, value, isActive) {
    const style = isActive
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";

    return `
      <button data-area="${value}"
        class="px-4 py-2 ${style} rounded-full font-medium text-sm whitespace-nowrap transition-all">
        ${label}
      </button>
    `;
  }
  createCategoryCard(category) {
    const ring =
      this.activeCategory === category.name ? "ring-2 ring-emerald-500" : "";
    const { icon, from, to } = getCategoryStyle(category.name);

    return `
      <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group ${ring}"
           data-category="${category.name}">
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
               style="background: linear-gradient(135deg, ${from}, ${to})">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${category.name}</h3>
          </div>
        </div>
      </div>
    `;
  }

  createCard(meal) {
    const area = meal.area || "International";
    const description = meal.instructions?.[0] || "Delicious recipe to try!";

    return `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.id}">
        <div class="relative h-48 overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
               src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category}</span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${area}</span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">${description}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area}
            </span>
          </div>
        </div>
      </div>
    `;
  }
}