import "./assets/style.css";
import { router, getCurrentRoute } from "./router/router.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import { globalState } from "./router/state.js"; // Usa globalState

function renderShell() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="root" class="min-h-screen flex flex-col">
      ${Navbar.render()}
      <main id="page" class="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6"></main>
      ${Footer.render()}
    </div>
  `;
  Navbar.afterRender();
}

async function renderPage() {
  const pageEl = document.getElementById("page");
  const Page = await router();
  if (!Page) {
    pageEl.innerHTML = `
      <div class="text-center text-soft">
        <h2 class="text-2xl font-semibold mb-2">Página no encontrada</h2>
        <p>La ruta solicitada no existe.</p>
      </div>
    `;
    Navbar.setActive(getCurrentRoute());
    return;
  }

  pageEl.innerHTML = (await Page.render) ? await Page.render() : "";
  if (Page.afterRender) await Page.afterRender();

  Navbar.setActive(getCurrentRoute());
}

function boot() {
  renderShell();
  renderPage();

  window.addEventListener("hashchange", renderPage);
  window.addEventListener("load", renderPage);

  // Suscripción global para re-render del navbar (usa globalState.subscribe)
  const unsubscribe = globalState.subscribe(() => {
    Navbar.refreshCounter();
  });

  // Cleanup al unload (opcional)
  window.addEventListener("beforeunload", unsubscribe);
}

boot();
