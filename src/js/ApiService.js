export default class ApiService {
  constructor(apiKey = "") {
    this.baseUrl = "https://nutriplan-api.vercel.app/api";
    this.apiKey = apiKey;
  }

  async request(path, options = {}) {
    const response = await fetch(this.baseUrl + path, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.error?.message || data?.error || `Request failed: ${response.status}`;
      throw new Error(message);
    }
    return data;
  }

  getMeals(limit = 25) {
    return this.request(`/meals/search?q=&limit=${limit}`);
  }

  getCategories() {
    return this.request("/meals/categories");
  }

  filterMeals({ category = "", area = "", limit = 25 } = {}) {
    const params = new URLSearchParams({ limit });
    if (category) params.append("category", category);
    if (area) params.append("area", area);
    return this.request(`/meals/filter?${params}`);
  }

  async getAreas() {
    const data = await this.request("/meals/areas");
    return [...new Set(data.results.map((area) => area.name))];
  }

  analyzeNutrition(recipeName, ingredients) {
    return this.request("/nutrition/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({ recipeName, ingredients }),
    });
  }
}