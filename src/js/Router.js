export default class Router {
  constructor(routes, defaultRoute = "meals") {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    window.addEventListener("hashchange", () => this.handle());
  }

  current() {
    return location.hash.replace("#", "") || this.defaultRoute;
  }

  handle() {
    const [name, ...rest] = this.current().split("/");
    const route = this.routes[name] || this.routes[this.defaultRoute];
    route(rest.join("/"));
  }

  go(path) {
    // لو إنت أصلاً على نفس الرابط، hashchange مش هيتنفذ، فننفذ بإيدينا
    if (this.current() === path) this.handle();
    else location.hash = path;
  }
}