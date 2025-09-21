const routes = {
  "/": () => import("../pages/inicio.js"),
  "/favorites": () => import("../pages/Favorites.js"),
  "/all-pokemons": () => import("../pages/AllPokemons.js"), // Nueva página
};

export function getCurrentRoute() {
  const hash = window.location.hash || "#/";
  const path = hash.slice(1); // Quita '#'
  return path.split("?")[0] || "/";
}

export async function router() {
  try {
    const path = getCurrentRoute();
    const loader = routes[path];

    if (!loader) {
      console.error(`Ruta no encontrada: ${path}`);
      return null;
    }

    const module = await loader();
    if (!module.default) {
      console.error(
        `No se encontró export default en el módulo para la ruta: ${path}`
      );
      return null;
    }

    return module.default;
  } catch (error) {
    console.error("Error en el router:", error);
    return null;
  }
}

export function navigateTo(path) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    console.warn("Invalid path for navigateTo:", path);
    return;
  }
  window.location.hash = path;
  // Dispara evento hashchange para trigger renderPage
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export default navigateTo();
