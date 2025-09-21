import { globalState } from "../router/state.js";
import { pokemonAPI } from "../services/pokemonApi.js";
import { navigateTo } from "../router/router.js";

export class FavoritesPage {
  constructor() {
    this.eventListeners = [];
    this.selectedPokemon = null; // Track selected Pokémon for modal
  }

  async render() {
    const pageEl = document.getElementById("page");
    if (!pageEl) {
      console.warn("Page element not found");
      return;
    }

    pageEl.innerHTML = this.getTemplate();
    await this.afterRender();
    return pageEl.innerHTML;
  }

  getTemplate() {
    const state = globalState.getState();
    const favorites = state.favorites || [];

    return `
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent mb-4">
            Pokémon Favoritos
          </h2>
          <p class="text-gray-400">
            ${favorites.length} Pokémon en tu colección
          </p>
        </div>

        ${
          favorites.length === 0
            ? `<div class="text-center py-20">
                <div class="mb-8">
                  <div class="text-6xl mb-4">💫</div>
                  <h3 class="text-xl font-bold text-gray-300 mb-2">No tienes favoritos aún</h3>
                  <p class="text-gray-500">Explora y marca tus Pokémon favoritos</p>
                </div>
                <a id="back-to-home" href="#/" class="inline-block bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
                  Volver al Inicio
                </a>
              </div>`
            : `<div id="favorites-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${favorites
                  .map((pokemon) => this.getPokemonCardHTML(pokemon))
                  .join("")}
              </div>`
        }

        <!-- Modal -->
        <div id="pokemon-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
          <div class="bg-card-bg border border-border-neon rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h2 id="modal-title" class="text-2xl font-bold text-neon-purple capitalize"></h2>
              <button id="close-modal" class="text-gray-400 hover:text-neon-purple text-2xl">&times;</button>
            </div>
            <div id="modal-content" class="space-y-4">
              <!-- Contenido del modal se llenará dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getPokemonCardHTML(pokemon) {
    return `
      <div class="bg-card-bg border border-border-neon rounded-lg p-4 hover:border-neon-purple/60 transition-all duration-300 hover:shadow-neon-purple cursor-pointer pokemon-card" data-pokemon-id="${
        pokemon.id
      }">
        <div class="flex flex-col items-center space-y-3">
          <div class="relative">
            <img 
              src="${
                pokemon.image ||
                `https://via.placeholder.com/128?text=${pokemon.name}`
              }" 
              alt="${pokemon.name}" 
              class="w-32 h-32 object-contain hover:scale-110 transition-transform duration-300" 
              onerror="this.src='https://via.placeholder.com/128?text=?'"
            />
            <button 
              class="favorite-btn absolute top-0 right-0 w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 transition-colors duration-300 text-white" 
              data-pokemon-id="${pokemon.id}"
              title="Quitar favorito"
            >
              ❤️
            </button>
          </div>
          <div class="text-center w-full">
            <h3 class="text-lg font-bold text-neon-purple capitalize mb-2">
              ${pokemon.name}
            </h3>
            <button 
              class="detail-btn w-full bg-gradient-to-r from-neon-purple to-neon-blue px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" 
              data-pokemon-id="${pokemon.id}"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getModalContent(pokemon) {
    return `
      <div class="flex flex-col items-center space-y-4">
        <img 
          src="${
            pokemon.image ||
            `https://via.placeholder.com/128?text=${pokemon.name}`
          }" 
          alt="${pokemon.name}" 
          class="w-48 h-48 object-contain rounded-lg"
          onerror="this.src='https://via.placeholder.com/128?text=?'"
        />
        <div class="text-center w-full">
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
          <div class="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3 w-full">
            <div class="text-center">Altura: <span class="text-neon-purple block">${
              pokemon.height
            }m</span></div>
            <div class="text-center">Peso: <span class="text-neon-purple block">${
              pokemon.weight
            }kg</span></div>
          </div>
          <!-- Estadísticas -->
          <div class="text-left w-full">
            <h3 class="text-lg font-semibold text-neon-purple mb-2">Estadísticas</h3>
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-400">
              ${pokemon.stats
                .map(
                  (stat) => `
                <div class="text-center">
                  <span class="capitalize">${stat.name
                    .replace("-", " ")
                    .replace("special", "sp.")}</span>: 
                  <span class="text-neon-purple">${stat.base_stat}</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Asegurar que el DOM esté listo
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Back button
    const backButton = document.getElementById("back-to-home");
    if (backButton) {
      const backHandler = (e) => {
        e.preventDefault();
        console.log("Back to home clicked, navigating to #/"); // Debug
        navigateTo("/");
      };
      backButton.addEventListener("click", backHandler);
      this.eventListeners.push({
        element: backButton,
        event: "click",
        handler: backHandler,
      });
    } else {
      console.warn("Back to home button not found");
    }

    // Favorite and detail buttons (delegation)
    const favoritesGrid = document.getElementById("favorites-grid");
    if (favoritesGrid) {
      const gridClickHandler = async (e) => {
        const detailBtn = e.target.closest(".detail-btn");
        const favBtn = e.target.closest(".favorite-btn");
        if (detailBtn) {
          console.log(
            "Detail button clicked for Pokémon ID:",
            detailBtn.dataset.pokemonId
          ); // Debug
          const pokemonId = parseInt(detailBtn.dataset.pokemonId);
          const state = globalState.getState();
          let pokemon = (state.favorites || []).find((p) => p.id === pokemonId);
          if (pokemon) {
            // Asegurar que las estadísticas estén disponibles
            if (!pokemon.stats) {
              try {
                const detailedPokemon = await pokemonAPI.fetchPokemonDetails(
                  pokemonId
                );
                pokemon = { ...pokemon, stats: detailedPokemon.stats };
                globalState.setState({
                  favorites: state.favorites.map((p) =>
                    p.id === pokemonId ? pokemon : p
                  ),
                });
              } catch (error) {
                console.error("Error fetching Pokémon details:", error);
                return;
              }
            }
            this.selectedPokemon = pokemon;
            const modal = document.getElementById("pokemon-modal");
            const modalTitle = document.getElementById("modal-title");
            const modalContent = document.getElementById("modal-content");
            if (modal && modalTitle && modalContent) {
              modalTitle.textContent = pokemon.name;
              modalContent.innerHTML = this.getModalContent(pokemon);
              modal.classList.remove("hidden");
            } else {
              console.warn("Modal elements not found");
            }
          } else {
            console.warn("Pokémon not found for ID:", pokemonId);
          }
        } else if (favBtn) {
          e.stopPropagation();
          const pokemonId = parseInt(favBtn.dataset.pokemonId);
          console.log("Favorite button clicked for Pokémon ID:", pokemonId); // Debug
          const state = globalState.getState();
          const pokemon = (state.favorites || []).find(
            (p) => p.id === pokemonId
          );
          if (pokemon) {
            console.log("Removing favorite:", pokemon.name); // Debug
            globalState.toggleFavorite(pokemon); // Should remove from favorites
            // Re-render the grid to reflect the updated favorites
            const pageEl = document.getElementById("page");
            if (pageEl) {
              pageEl.innerHTML = this.getTemplate();
              this.afterRender();
            }
          } else {
            console.warn("Pokémon not found for favorite ID:", pokemonId);
          }
        }
      };
      favoritesGrid.addEventListener("click", gridClickHandler);
      this.eventListeners.push({
        element: favoritesGrid,
        event: "click",
        handler: gridClickHandler,
      });
    } else if ((globalState.getState().favorites || []).length > 0) {
      console.warn("Favorites grid not found, but favorites exist");
    }

    // Close modal
    const closeModalBtn = document.getElementById("close-modal");
    if (closeModalBtn) {
      const closeHandler = () => {
        const modal = document.getElementById("pokemon-modal");
        if (modal) {
          modal.classList.add("hidden");
          this.selectedPokemon = null;
        }
      };
      closeModalBtn.addEventListener("click", closeHandler);
      this.eventListeners.push({
        element: closeModalBtn,
        event: "click",
        handler: closeHandler,
      });
    } else {
      console.warn("Close modal button not found");
    }

    // Close modal on outside click
    const modal = document.getElementById("pokemon-modal");
    if (modal) {
      const modalClickHandler = (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
          this.selectedPokemon = null;
        }
      };
      modal.addEventListener("click", modalClickHandler);
      this.eventListeners.push({
        element: modal,
        event: "click",
        handler: modalClickHandler,
      });
    } else {
      console.warn("Pokemon modal element not found");
    }
  }

  destroy() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}

export default new FavoritesPage();
