import ApiService from "./ApiService.js";
import ViewManager from "./ViewManager.js";
import StorageService from "./StorageService.js";
import Router from "./Router.js";
import HomePage from "./HomePage.js";
import MealDetailsPage from "./MealDetailsPage.js";
import FoodLogPage from "./FoodLogPage.js";
import { USDA_API_KEY } from "./config.js";

const api = new ApiService(USDA_API_KEY);
const views = new ViewManager();
const storage = new StorageService();

const router = new Router({
  meals: () => views.show("home"),
  scanner: () => views.show("scanner"),
  foodlog: () => {
    foodLog.render(); // أعد قراءة اللي اتسجل كل ما تفتح الصفحة
    views.show("foodlog");
  },
});

const mealDetails = new MealDetailsPage(api, () => router.go("meals"), storage);
const home = new HomePage(api, (meal) => {
  mealDetails.render(meal);
  views.show("meal");
});
const foodLog = new FoodLogPage(storage, (route) => router.go(route));

// ربط روابط القايمة الجانبية
const routeNames = ["meals", "scanner", "foodlog"];
document.querySelectorAll("#sidebar .nav-link").forEach((link, index) => {
  link.setAttribute("href", `#${routeNames[index]}`);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    router.go(routeNames[index]);
  });
});

router.handle();

try {
  await home.init();
} catch (error) {
  console.error(error);
} finally {
  const overlay = document.getElementById("app-loading-overlay");
  overlay.style.opacity = "0";
  setTimeout(() => overlay.remove(), 500);
}