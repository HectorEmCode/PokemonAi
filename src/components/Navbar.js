import {
  getState,
  incrementCounter,
  decrementCounter,
} from "../router/state.js";

const Navbar = {
  render() {
    const { counter } = getState();
    return `
      <header class="border-b border-steel bg-ink/60 backdrop-blur supports-[backdrop-filter]:bg-ink/50">
        <nav class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="#/" class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-neon glow"></span>
            <span class="text-lg font-semibold text-white">Pokémon-Ai</span>
          </a>

          <button id="menuBtn" class="sm:hidden btn-neon px-3 py-1.5 rounded-md transition-base" aria-label="Abrir menú">
            ☰
          </button>

          <ul id="navLinks" class="hidden sm:flex items-center gap-6 text-soft">
            <li><a href="#/" data-route="/" class="hover:text-white transition-base">Inicio</a></li>
            <li><a href="#/favorites" data-route="/favorites" class="hover:text-white transition-base">Favoritos</a></li>
            <li><a href="#/all-pokemons" data-route="/all-pokemons" class="hover:text-white transition-base">Todos los Pokémon</a></li>
            <li>
              <div class="flex items-center gap-2">
                <button id="decBtn" class="btn-neon px-2 py-1 rounded">-</button>
                <span id="counterBadge" class="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded bg-steel text-white">
                  ${counter}
                </span>
                <button id="incBtn" class="btn-neon px-2 py-1 rounded">+</button>
              </div>
            </li>
          </ul>
        </nav>

        <!-- Menú móvil -->
        <div id="mobileMenu" class="sm:hidden hidden border-t border-steel">
          <ul class="px-4 py-3 space-y-3 text-soft">
            <li><a href="#/" data-route="/" class="block hover:text-white">Inicio</a></li>
            <li><a href="#/favorites" data-route="/sobre" class="block hover:text-white">Favoritos</a></li>
            <li><a href="#/all-pokemons" data-route="/all-pokemons" class="block hover:text-white">Todos los Pokémon</a></li>
            <li>
              <div class="flex items-center gap-3 pt-2">
                <button id="mDecBtn" class="btn-neon px-2 py-1 rounded">-</button>
                <span id="mCounterBadge" class="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded bg-steel text-white">
                  ${counter}
                </span>
                <button id="mIncBtn" class="btn-neon px-2 py-1 rounded">+</button>
              </div>
            </li>
          </ul>
        </div>
      </header>
    `;
  },

  afterRender() {
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Eventos de contador
    const incBtn = document.getElementById("incBtn");
    const decBtn = document.getElementById("decBtn");
    const mIncBtn = document.getElementById("mIncBtn");
    const mDecBtn = document.getElementById("mDecBtn");

    if (incBtn) incBtn.addEventListener("click", incrementCounter);
    if (decBtn) decBtn.addEventListener("click", decrementCounter);
    if (mIncBtn) mIncBtn.addEventListener("click", incrementCounter);
    if (mDecBtn) mDecBtn.addEventListener("click", decrementCounter);
  },

  setActive(currentRoute) {
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll("a[data-route]");
    navLinks.forEach((link) => {
      link.classList.remove("text-neon", "border-b-2", "border-neon");
      link.classList.add("text-soft");
    });

    // Add active class to current route
    const activeLink = document.querySelector(
      `a[data-route="${currentRoute}"]`
    );
    if (activeLink) {
      activeLink.classList.remove("text-soft");
      activeLink.classList.add("text-neon", "border-b-2", "border-neon");
    }
  },

  refreshCounter() {
    const { counter } = getState();
    const counterBadge = document.getElementById("counterBadge");
    const mCounterBadge = document.getElementById("mCounterBadge");

    if (counterBadge) counterBadge.textContent = counter;
    if (mCounterBadge) mCounterBadge.textContent = counter;
  },
};
export default Navbar;
