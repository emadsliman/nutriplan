export default class ViewManager {
  constructor() {
    this.views = {
      home: {
        sections: ["search-filters-section", "meal-categories-section", "all-recipes-section"],
        nav: 0,
        title: "Meals & Recipes",
        subtitle: "Discover delicious and nutritious recipes tailored for you",
      },
      meal: {
        sections: ["meal-details"],
        nav: 0,
        title: "Recipe Details",
        subtitle: "View full recipe information and nutrition facts",
      },
      scanner: {
        sections: ["products-section"],
        nav: 1,
        title: "Product Scanner",
        subtitle: "Search packaged foods and view their nutrition",
      },
      foodlog: {
        sections: ["foodlog-section"],
        nav: 2,
        title: "Food Log",
        subtitle: "Track your daily nutrition and food intake",
      },
    };

    this.navLinks = document.querySelectorAll("#sidebar .nav-link");
    this.title = document.querySelector("#header h1");
    this.subtitle = document.querySelector("#header p");
  }

  show(name) {
    const current = this.views[name];

    // أظهر قسم الصفحة الحالية وأخفي الباقي
    for (const [viewName, view] of Object.entries(this.views)) {
      view.sections.forEach((id) => {
        document.getElementById(id).style.display =
          viewName === name ? "" : "none";
      });
    }

    // العنوان فوق
    this.title.textContent = current.title;
    this.subtitle.textContent = current.subtitle;

    // الزرار النشط في القايمة
    this.navLinks.forEach((link, index) => {
      const active = index === current.nav;
      link.classList.toggle("bg-emerald-50", active);
      link.classList.toggle("text-emerald-700", active);
      link.classList.toggle("text-gray-600", !active);
      link.classList.toggle("hover:bg-gray-50", !active);

      const label = link.querySelector("span");
      label.classList.toggle("font-semibold", active);
      label.classList.toggle("font-medium", !active);
    });

    window.scrollTo(0, 0);
  }
}