import { pokemonAPI } from "../services/pokemonApi.js";
import { globalState } from "../router/state.js";
import { navigateTo } from "../router/router.js";

export class AllPokemonsPage {
  constructor() {
    this.eventListeners = [];
    this.currentPage = 1;
    this.pokemonPerPage = 50;
    this.unsubscribe = globalState.subscribe(() => this.updateUI());
    this.selectedPokemon = null; // Track selected Pokémon for modal
    this.searchTimeout = null; // For debouncing search
  }

  async render() {
    const pageEl = document.getElementById("page");
    if (!pageEl) {
      console.warn("Page element not found");
      return;
    }

    // Mostrar loading
    globalState.setState({ loading: true });
    pageEl.innerHTML = this.getLoadingTemplate();

    // Obtener estado con check seguro
    const state = globalState.getState();
    console.log("Estado inicial en render:", state); // TEMP: Debug, remueve después

    // Inicializar pokemonList y favorites si son undefined
    if (!state.pokemonList) {
      globalState.setState({ pokemonList: [] });
    }
    if (!state.favorites) {
      globalState.setState({ favorites: [] });
    }

    // Cargar Pokémon si la lista está vacía
    if (!state.pokemonList || state.pokemonList.length === 0) {
      await this.loadAllPokemon();
    }

    // Renderizar template
    pageEl.innerHTML = this.getTemplate();
    this.renderPokemonGrid(); // Muestra grid
    globalState.setState({ loading: false });

    // Adjuntar eventos después de renderizar
    await this.afterRender();

    return pageEl.innerHTML;
  }

  async loadAllPokemon() {
    try {
      const data = await pokemonAPI.fetchPokemonList(1025); // Todos
      globalState.setState({
        pokemonList: data.results.filter((p) => p !== null) || [], // Asegura array
        totalPages: data.totalPages || Math.ceil(1025 / 50),
      });
      console.log("Pokémon cargados:", data.results.length); // TEMP: Debug
    } catch (error) {
      console.error("Error loading all Pokémon:", error);
      globalState.setState({ pokemonList: [] }); // Asegura array vacío
      const gridEl = document.getElementById("pokemon-grid");
      if (gridEl) {
        gridEl.innerHTML = `
          <div class="text-center py-12">
            <p class="text-soft text-lg">Error al cargar Pokémon. Verifica tu conexión.</p>
            <button onclick="location.reload()" class="btn-neon px-4 py-2 mt-4 rounded">Reintentar</button>
          </div>
        `;
      }
    }
  }

  getLoadingTemplate() {
    return `
      <div class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-neon"></div>
        <span class="ml-4 text-lg text-soft">Cargando todos los Pokémon...</span>
      </div>
    `;
  }

  getTemplate() {
    const state = globalState.getState();
    // Check seguro para length
    const pokemonCount = (state.pokemonList || []).length;
    return `
      <div class="container mx-auto px-4 py-8 space-y-8">
        <!-- Título -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-neon mb-2">Todos los Pokémon</h1>
          <p class="text-soft">Explora los ${pokemonCount} Pokémon disponibles. Agrega favoritos para guardarlos.</p>
        </div>

        <!-- Barra de Búsqueda -->
        <div class="max-w-md mx-auto">
          <input
            id="search-input"
            type="text"
            placeholder="Buscar por nombre (ej. pikachu)..."
            value="${state.searchQuery || ""}"
            class="w-full px-4 py-3 bg-ink border border-steel rounded-lg focus:border-neon focus:outline-none text-white placeholder-soft"
          />
        </div>

        <!-- Grid y Contador -->
        <div id="pokemon-grid" class="space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-xl font-semibold text-soft">
              Pokémon Encontrados: <span id="pokemon-count">${
                this.getFilteredPokemon().length
              }</span>
            </h2>
          </div>
          <div id="grid-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
          
          <!-- Paginación -->
          <div id="pagination" class="flex justify-center items-center gap-4 mt-8">
            <button id="prev-page" class="btn-neon px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled>Anterior</button>
            <span id="page-info" class="text-soft">Página 1 de 1</span>
            <button id="next-page" class="btn-neon px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
          </div>
        </div>

        <!-- Info de Favoritos -->
        <div class="text-center text-soft">
          <p>❤️ Favoritos guardados: <span id="favorites-count">${
            (state.favorites || []).length
          }</span>. <a id="favorites-link" href="#/favorites" class="text-neon hover:underline">Ver todos</a></p>
        </div>

        <!-- Modal -->
        <div id="pokemon-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
          <div class="bg-ink border border-steel rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h2 id="modal-title" class="text-2xl font-bold text-neon capitalize"></h2>
              <button id="close-modal" class="text-soft hover:text-neon text-2xl">&times;</button>
            </div>
            <div id="modal-content" class="space-y-4">
              <!-- Contenido del modal se llenará dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredPokemon() {
    const state = globalState.getState();
    // Check seguro: Asegura pokemonList es array
    const pokemonList = state.pokemonList || [];
    const query = (state.searchQuery || "").trim().toLowerCase();
    if (!query) return pokemonList; // Retornar todos si no hay query
    return pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );
  }

  renderPokemonGrid() {
    const filtered = this.getFilteredPokemon();
    const totalPages = Math.ceil(filtered.length / this.pokemonPerPage);
    const start = (this.currentPage - 1) * this.pokemonPerPage;
    const end = start + this.pokemonPerPage;
    const pagePokemon = filtered.slice(start, end);

    const container = document.getElementById("grid-container");
    if (!container) {
      console.warn("Grid container not found");
      return;
    }

    // Actualizar contador
    const countEl = document.getElementById("pokemon-count");
    if (countEl) countEl.textContent = filtered.length;

    // Render cards
    container.innerHTML = pagePokemon
      .map((pokemon) => this.getPokemonCardHTML(pokemon))
      .join("");

    // Actualizar paginación
    const pageInfo = document.getElementById("page-info");
    if (pageInfo) {
      pageInfo.textContent = `Página ${this.currentPage} de ${totalPages || 1}`;
    }
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn)
      nextBtn.disabled =
        this.currentPage >= totalPages || filtered.length === 0;

    // Actualizar contador de favoritos
    const favCountEl = document.getElementById("favorites-count");
    if (favCountEl) {
      const state = globalState.getState();
      favCountEl.textContent = (state.favorites || []).length;
    }
  }

  getPokemonCardHTML(pokemon) {
    const state = globalState.getState();
    const isFav = (state.favorites || []).some((fav) => fav.id === pokemon.id);

    return `
      <div class="bg-ink border border-steel rounded-lg p-4 hover:border-neon transition-all duration-300 hover:shadow-neon cursor-pointer pokemon-card" data-pokemon-id="${
        pokemon.id
      }">
        <div class="flex flex-col items-center space-y-3">
          <!-- Imagen -->
          <div class="relative">
            <img 
              src="${
                pokemon.image ||
                `https://via.placeholder.com/128?text=${pokemon.name}`
              }"
              alt="${pokemon.name}"
              class="w-32 h-32 object-contain hover:scale-110 transition-transform duration-300 rounded-lg"
              onerror="this.src='https://via.placeholder.com/128?text=?'"
            />
            <!-- Botón Favorito -->
            <button
              class="favorite-btn absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-300 ${
                isFav
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-steel text-soft hover:bg-neon"
              }" 
              data-pokemon-id="${pokemon.id}"
              title="${isFav ? "Quitar favorito" : "Agregar a favoritos"}"
            >
              ${isFav ? "❤️" : "🤍"}
            </button>
          </div>
          
          <!-- Detalles -->
          <div class="text-center w-full">
            <h3 class="text-lg font-bold text-neon capitalize mb-2">${
              pokemon.name
            }</h3>
            <p class="text-soft text-sm mb-2">#${pokemon.id
              .toString()
              .padStart(3, "0")}</p>
            
            <!-- Tipos -->
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
            
            <!-- Stats básicos -->
            <div class="grid grid-cols-2 gap-2 text-sm text-soft mb-3 w-full">
              <div class="text-center">Altura: <span class="text-neon block">${
                pokemon.height
              }m</span></div>
              <div class="text-center">Peso: <span class="text-neon block">${
                pokemon.weight
              }kg</span></div>
            </div>
            
            <!-- Botón Detalles -->
            <button class="detail-btn w-full bg-neon px-4 py-2 rounded-lg text-ink font-medium hover:opacity-90 transition-opacity" data-pokemon-id="${
              pokemon.id
            }">
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
          <p class="text-soft text-sm mb-2">#${pokemon.id
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
          <div class="grid grid-cols-2 gap-2 text-sm text-soft mb-3 w-full">
            <div class="text-center">Altura: <span class="text-neon block">${
              pokemon.height
            }m</span></div>
            <div class="text-center">Peso: <span class="text-neon block">${
              pokemon.weight
            }kg</span></div>
          </div>
          <!-- Estadísticas -->
          <div class="text-left w-full">
            <h3 class="text-lg font-semibold text-neon mb-2">Estadísticas</h3>
            <div class="grid grid-cols-2 gap-2 text-sm text-soft">
              ${pokemon.stats
                .map(
                  (stat) => `
                <div class="text-center">
                  <span class="capitalize">${stat.name
                    .replace("-", " ")
                    .replace("special", "sp.")}</span>: 
                  <span class="text-neon">${stat.base_stat}</span>
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

  attachEventListeners() {
    // Búsqueda con debouncing
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      const searchHandler = (e) => {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
          const query = e.target.value.trim();
          globalState.setState({ searchQuery: query, loading: true });
          this.currentPage = 1; // Resetear a página 1
          this.renderPokemonGrid();
          globalState.setState({ loading: false });
        }, 300);
      };
      searchInput.addEventListener("input", searchHandler);
      this.eventListeners.push({
        element: searchInput,
        event: "input",
        handler: searchHandler,
      });
    } else {
      console.warn("Search input element not found");
    }

    // Paginación
    const prevBtn = document.getElementById("prev-page");
    if (prevBtn) {
      const prevHandler = () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderPokemonGrid();
        }
      };
      prevBtn.addEventListener("click", prevHandler);
      this.eventListeners.push({
        element: prevBtn,
        event: "click",
        handler: prevHandler,
      });
    } else {
      console.warn("Previous page button not found");
    }

    const nextBtn = document.getElementById("next-page");
    if (nextBtn) {
      const nextHandler = () => {
        const filtered = this.getFilteredPokemon();
        const totalPages = Math.ceil(filtered.length / this.pokemonPerPage);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderPokemonGrid();
        }
      };
      nextBtn.addEventListener("click", nextHandler);
      this.eventListeners.push({
        element: nextBtn,
        event: "click",
        handler: nextHandler,
      });
    } else {
      console.warn("Next page button not found");
    }

    // Botones Detalle y Favorito (delegación)
    const gridContainer = document.getElementById("grid-container");
    if (gridContainer) {
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
          let pokemon = (state.pokemonList || []).find(
            (p) => p.id === pokemonId
          );
          if (pokemon) {
            // Asegurar que las estadísticas estén disponibles
            if (!pokemon.stats) {
              try {
                const detailedPokemon = await pokemonAPI.fetchPokemonDetails(
                  pokemonId
                );
                pokemon = { ...pokemon, stats: detailedPokemon.stats };
                globalState.setState({
                  pokemonList: state.pokemonList.map((p) =>
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
          const pokemon = (state.pokemonList || []).find(
            (p) => p.id === pokemonId
          );
          if (pokemon) {
            console.log("Toggling favorite for:", pokemon.name); // Debug
            globalState.toggleFavorite(pokemon);
            // Forzar actualización del botón
            const updatedState = globalState.getState();
            const isFav = (updatedState.favorites || []).some(
              (fav) => fav.id === pokemon.id
            );
            favBtn.className = `favorite-btn absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors duration-300 ${
              isFav
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-steel text-soft hover:bg-neon"
            }`;
            favBtn.innerHTML = isFav ? "❤️" : "🤍";
            favBtn.title = isFav ? "Quitar favorito" : "Agregar a favoritos";
            // Actualizar contador de favoritos
            const favCountEl = document.getElementById("favorites-count");
            if (favCountEl) {
              favCountEl.textContent = (updatedState.favorites || []).length;
            }
          } else {
            console.warn("Pokémon not found for favorite ID:", pokemonId);
          }
        }
      };
      gridContainer.addEventListener("click", gridClickHandler);
      this.eventListeners.push({
        element: gridContainer,
        event: "click",
        handler: gridClickHandler,
      });
    } else {
      console.warn("Grid container element not found");
    }

    // Evento para cerrar el modal
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

    // Cerrar modal al hacer clic fuera del contenido
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

    // Evento para el enlace de favoritos
    const favoritesLink = document.getElementById("favorites-link");
    if (favoritesLink) {
      const favoritesHandler = (e) => {
        e.preventDefault();
        console.log("Favorites link clicked, navigating to #/favorites"); // Debug
        const state = globalState.getState();
        console.log("Current favorites:", state.favorites || []); // Debug
        navigateTo("/favorites");
      };
      favoritesLink.addEventListener("click", favoritesHandler);
      this.eventListeners.push({
        element: favoritesLink,
        event: "click",
        handler: favoritesHandler,
      });
    } else {
      console.warn("Favorites link element not found");
    }
  }

  async afterRender() {
    // Asegurar que el DOM esté listo antes de adjuntar eventos
    await new Promise((resolve) => setTimeout(resolve, 0)); // Forzar un tick del event loop
    this.attachEventListeners();
  }

  updateUI() {
    const state = globalState.getState();
    // Actualizar contador de favoritos en el DOM
    const favCountEl = document.querySelector("#navbar .fav-count");
    if (favCountEl) {
      favCountEl.textContent = (state.favorites || []).length;
    }
    const pageFavCountEl = document.getElementById("favorites-count");
    if (pageFavCountEl) {
      pageFavCountEl.textContent = (state.favorites || []).length;
    }
    // Re-renderizar grid para reflejar cambios en favoritos
    this.renderPokemonGrid();
  }

  destroy() {
    // Remover event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    // Limpiar timeout de búsqueda
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    // Cancelar suscripción
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default new AllPokemonsPage();
