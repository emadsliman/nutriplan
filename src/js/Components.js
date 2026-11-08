// =========== Loading Spinner Design ============
/*
<div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
</div>
*/

// =========== Empty State Design ============
/*
<div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
    </div>
    <p class="text-gray-500 text-lg">No recipes found</p>
    <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
</div>
*/
export function loadingSpinner() {
  return `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  `;
}

export function emptyState(
  title = "No recipes found",
  subtitle = "Try searching for something else"
) {
  return `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg">${title}</p>
      <p class="text-gray-400 text-sm mt-2">${subtitle}</p>
    </div>
  `;
}
const categoryStyles = {
  Beef: { icon: "fa-burger", from: "#ef4444", to: "#b91c1c" },
  Chicken: { icon: "fa-drumstick-bite", from: "#f59e0b", to: "#d97706" },
  Dessert: { icon: "fa-ice-cream", from: "#ec4899", to: "#be185d" },
  Lamb: { icon: "fa-bone", from: "#b45309", to: "#78350f" },
  Miscellaneous: { icon: "fa-shapes", from: "#6b7280", to: "#374151" },
  Pasta: { icon: "fa-bowl-food", from: "#eab308", to: "#ca8a04" },
  Pork: { icon: "fa-bacon", from: "#fb7185", to: "#e11d48" },
  Seafood: { icon: "fa-fish", from: "#3b82f6", to: "#0ea5e9" },
  Side: { icon: "fa-bowl-rice", from: "#84cc16", to: "#65a30d" },
  Starter: { icon: "fa-cheese", from: "#f97316", to: "#ea580c" },
  Vegan: { icon: "fa-seedling", from: "#22c55e", to: "#15803d" },
  Vegetarian: { icon: "fa-carrot", from: "#10b981", to: "#0d9488" },
  Breakfast: { icon: "fa-mug-hot", from: "#facc15", to: "#f59e0b" },
  Goat: { icon: "fa-paw", from: "#78716c", to: "#44403c" },
};

export function getCategoryStyle(name) {
  return (
    categoryStyles[name] || { icon: "fa-utensils", from: "#34d399", to: "#22c55e" }
  );
}