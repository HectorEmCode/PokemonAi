import { pokemonAPI } from "../services/pokemonApi.js";
import { globalState } from "../router/state.js";
import { router } from "../router/router.js";

export class HomePage {
  constructor() {
    this.eventListeners = [];
    globalState.subscribe(() => this.updateUI());
  }

  async render() {
    const mainContent = document.getElementById("main-content");
    // Mostrar loading
    globalState.setState({ loading: true });
    mainContent.innerHTML = this.getLoadingTemplate();

    // Cargar Pokémon si no están cargados
    const state = globalState.getState();
    if (state.pokemonList.length === 0) {
      await this.loadPokemon();
    }

    // Renderizar contenido
    mainContent.innerHTML = this.getTemplate();
    this.attachEventListeners();
    globalState.setState({ loading: false });
  }

  async loadPokemon() {
    try {
      const data = await pokemonAPI.fetchPokemonList(50);
      globalState.setState({
        pokemonList: data.results.filter((p) => p !== null),
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Error loading Pokemon:", error);
    }
  }

  getLoadingTemplate() {
    return `
    <div class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue"></div>
      <span class="ml-4 text-lg text-gray-300">Cargando Pokémon...</span>
    </div>
  `;
  }

  getTemplate() {
    const state = globalState.getState();
    const filteredPokemon = state.pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    return `
  <div class="container mx-auto px-4 py-8">
    <!-- Search Bar -->
    <div class="mb-8">
      <div class="max-w-md mx-auto">
        <input
          id="search-input"
          type="text"
          placeholder="Buscar Pokémon..."
          value="${state.searchQuery}"
          class="w-full px-4 py-3 bg-card-bg border border-border-neon rounded-lg focus:border-neon-blue focus:outline-none text-white placeholder-gray-400"
        />
      </div>
    </div>

    <!-- Pokemon Grid -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-300">
        Pokémon Encontrados (${filteredPokemon.length})
      </h2>
    </div>

    ${
      filteredPokemon.length === 0
        ? '<div class="text-center py-12"><p class="text-gray-400 text-lg">No se encontraron Pokémon</p></div>'
        : `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${filteredPokemon
          .map((pokemon) => this.getPokemonCardHTML(pokemon))
          .join("")}
      </div>`
    }
  </div>
`;
  }

  getPokemonCardHTML(pokemon) {
    const state = globalState.getState();
    const isFav = state.favorites.some((fav) => fav.id === pokemon.id);

    return `
  <div class="bg-card-bg border border-border-neon rounded-lg p-4 hover:border-neon-blue/60 transition-all duration-300 hover:shadow-neon cursor-pointer pokemon-card" data-pokemon-id="${
    pokemon.id
  }">
    <div class="flex flex-col items-center space-y-3">
      <div class="relative">
        <img 
          src="${
            pokemon.image ||
            `https://placeholder-image-service.onrender.com/image/200x200?prompt=Pokemon character ${pokemon.name} in official artwork style&id=84c5eecb-2a89-4afe-95da-21ff3572ed99&customer_id=cus_Swfh6JEowaZ11P`
          }"
          alt="Official artwork of ${
            pokemon.name
          } pokemon character with distinctive features and colors"
          class="w-32 h-32 object-contain hover:scale-110 transition-transform duration-300"
        />
        <button
          class="favorite-btn absolute top-0 right-0 w-8 h-8 rounded-full ${
            isFav
              ? "bg-pink-500 hover:bg-pink-600"
              : "bg-gray-700 hover:bg-gray-600"
          } transition-colors duration-300"
          data-pokemon-id="${pokemon.id}"
        >
          ${isFav ? "❤️" : "🤍"}
        </button>
      </div>
      
      <div class="text-center w-full">
        <h3 class="text-lg font-bold text-neon-blue capitalize mb-2">
          ${pokemon.name}
        </h3>
        <p class="text-gray-400 text-sm mb-2">#${pokemon.id
          .toString()
          .padStart(3, "0")}</p>
        
        <div class="flex flex-wrap gap-1 justify-center mb-3">
          ${pokemon.types
            .map(
              (type) => `
            <span class="px-2 py-1 rounded-full text-xs font-medium text-white capitalize" style="background-color: ${pokemonAPI.getTypeColor(
              type
            )}">
              ${type}
            </span>
          `
            )
            .join("")}
        </div>
        
        <div class="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-3">
          <div>
            <span class="text-gray-400">Altura:</span><br>
            <span class="text-neon-blue">${pokemon.height}m</span>
          </div>
          <div>
            <span class="text-gray-400">Peso:</span><br>
            <span class="text-neon-blue">${pokemon.weight}kg</span>
          </div>
        </div>
        
        <button class="detail-btn w-full bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" data-pokemon-id="${
          pokemon.id
        }">
          Ver Detalles
        </button>
      </div>
    </div>
  </div>
`;
  }

  attachEventListeners() {
    // Search input const searchInput = document.getElementById('search-input'); if (searchInput) { const searchHandler = (e) => { globalState.setState({ searchQuery: e.target.value }); }; searchInput.addEventListener('input', searchHandler); this.eventListeners.push({ element: searchInput, event: 'input', handler: searchHandler }); }

    // Pokemon cards
    document.querySelectorAll(".pokemon-card").forEach((card) => {
      const cardHandler = () => {
        const pokemonId = parseInt(card.dataset.pokemonId);
        const pokemon = globalState
          .getState()
          .pokemonList.find((p) => p.id === pokemonId);
        if (pokemon) {
          globalState.setCurrentPokemon(pokemon);
          router.navigateTo("/pokemon-detail");
        }
      };
      card.addEventListener("click", cardHandler);
      this.eventListeners.push({
        element: card,
        event: "click",
        handler: cardHandler,
      });
    });

    // Favorite buttons
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      const favHandler = (e) => {
        e.stopPropagation();
        const pokemonId = parseInt(btn.dataset.pokemonId);
        const pokemon = globalState
          .getState()
          .pokemonList.find((p) => p.id === pokemonId);
        if (pokemon) {
          globalState.toggleFavorite(pokemon);
        }
      };
      btn.addEventListener("click", favHandler);
      this.eventListeners.push({
        element: btn,
        event: "click",
        handler: favHandler,
      });
    });

    // Detail buttons
    document.querySelectorAll(".detail-btn").forEach((btn) => {
      const detailHandler = (e) => {
        e.stopPropagation();
        const pokemonId = parseInt(btn.dataset.pokemonId);
        const pokemon = globalState
          .getState()
          .pokemonList.find((p) => p.id === pokemonId);
        if (pokemon) {
          globalState.setCurrentPokemon(pokemon);
          router.navigateTo("/pokemon-detail");
        }
      };
      btn.addEventListener("click", detailHandler);
      this.eventListeners.push({
        element: btn,
        event: "click",
        handler: detailHandler,
      });
    });
  }

  updateUI() {
    // Re-renderizar solo si es necesario const mainContent = document.getElementById('main-content'); if (mainContent && !globalState.getState().loading) { const currentHTML = mainContent.innerHTML; const newHTML = this.getTemplate(); if (currentHTML !== newHTML) { mainContent.innerHTML = newHTML; this.attachEventListeners(); } } }
  }

  destroy() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}

export default new HomePage();
