export default class StorageService {
  constructor(key = "nutriplan-foodlog") {
    this.key = key;
  }

  today() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  }

  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  getByDate(date = this.today()) {
    return this.getAll().filter((item) => item.date === date);
  }

  add(item) {
    const items = this.getAll();
    const entry = {
      id: Date.now().toString(),
      date: this.today(),
      loggedAt: new Date().toISOString(),
      ...item,
    };
    items.push(entry);
    this.save(items);
    return entry;
  }

  remove(id) {
    this.save(this.getAll().filter((item) => item.id !== id));
  }

  clearDate(date = this.today()) {
    this.save(this.getAll().filter((item) => item.date !== date));
  }
}