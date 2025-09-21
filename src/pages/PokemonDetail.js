import { subscribe, getState } from "../router/state.js";

class PokemonDetailPage {
  constructor() {
    this.eventListeners = [];
    subscribe(() => this.updateUI()); // Using subscribe from state.js directly
  }

  render() {
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  getTemplate() {
    const state = getState(); // Using getState to access current pokemon
    const pokemon = state.currentPokemon;

    if (!pokemon) {
      return `
        <div class="container mx-auto px-4 py-8 text-center">
          <h2 class="text-2xl text-gray-300">No se encontró el Pokémon</h2>
          <a href="#/" class="text-neon-purple hover:text-neon-blue">Volver al inicio</a>
        </div>
      `;
    }

    return `
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto bg-card-bg border border-border-neon rounded-lg p-6">
          <h2 class="text-3xl font-bold text-neon-purple capitalize mb-4">${
            pokemon.name
          }</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src="${pokemon.image}" alt="${
      pokemon.name
    }" class="w-full rounded-lg">
            </div>
            <div class="text-gray-300">
              <p>ID: ${pokemon.id}</p>
              <p>Types: ${pokemon.types?.join(", ") || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Add event listeners if needed
  }

  updateUI() {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.innerHTML = this.getTemplate();
      this.attachEventListeners();
    }
  }

  destroy() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}

export default new PokemonDetailPage();
