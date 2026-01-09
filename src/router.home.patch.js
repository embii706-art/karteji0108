import { renderHome } from "./pages/home.js";

export function resolveRoute(path) {
  const app = document.getElementById("app");

  if (path === "/home") {
    app.innerHTML = renderHome();
    return;
  }

  app.innerHTML = `<p class="p-4">Halaman tidak ditemukan</p>`;
}
