const STORAGE_KEY = "spa_state_v1";

// Defaults completos (siempre disponibles)
const DEFAULT_STATE = {
  counter: 0,
  favorites: [],
  pokemonList: [],
  searchQuery: "",
  currentPokemon: null,
  loading: false,
  totalPages: 0,
  classifiedPokemon: null, // Para clasificación si lo usas
};

let internalState = load() || DEFAULT_STATE;
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Merge con defaults: Copia propiedades del parsed, pero usa defaults para faltantes
    return { ...DEFAULT_STATE, ...parsed };
  } catch (error) {
    console.warn("Error loading state from localStorage:", error);
    return null; // Fallback a defaults
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(internalState));
  } catch {
    // Ignora errores (ej. modo privado)
  }
}

// Proxy reactivo (mismo de antes)
const reactiveState = new Proxy(internalState, {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    persist();
    notifyListeners();
    return true;
  },
});

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn(reactiveState);
    } catch (e) {
      console.warn("Error en listener:", e);
    }
  });
}

// globalState con getters/setters y métodos (mismo, pero usa reactiveState con defaults)
export const globalState = {
  // Getters/Setters reactivos (siempre devuelven valores válidos)
  get counter() {
    return reactiveState.counter ?? 0;
  },
  set counter(value) {
    reactiveState.counter = value;
  },
  get favorites() {
    return reactiveState.favorites ?? [];
  },
  set favorites(value) {
    reactiveState.favorites = value;
  },
  get pokemonList() {
    return reactiveState.pokemonList ?? [];
  },
  set pokemonList(value) {
    reactiveState.pokemonList = value;
  },
  get searchQuery() {
    return reactiveState.searchQuery ?? "";
  },
  set searchQuery(value) {
    reactiveState.searchQuery = value;
  },
  get currentPokemon() {
    return reactiveState.currentPokemon ?? null;
  },
  set currentPokemon(value) {
    reactiveState.currentPokemon = value;
  },
  get loading() {
    return reactiveState.loading ?? false;
  },
  set loading(value) {
    reactiveState.loading = value;
  },
  get totalPages() {
    return reactiveState.totalPages ?? 0;
  },
  set totalPages(value) {
    reactiveState.totalPages = value;
  },
  get classifiedPokemon() {
    return reactiveState.classifiedPokemon ?? null;
  },
  set classifiedPokemon(value) {
    reactiveState.classifiedPokemon = value;
  },

  // Métodos (mismos de antes)
  getState() {
    return { ...DEFAULT_STATE, ...reactiveState }; // Siempre mergea defaults
  },

  setState(partial) {
    Object.assign(reactiveState, partial);
  },

  incrementCounter() {
    reactiveState.counter = (reactiveState.counter || 0) + 1;
  },

  decrementCounter() {
    reactiveState.counter = Math.max(0, (reactiveState.counter || 0) - 1);
  },

  toggleFavorite(pokemon) {
    const index = reactiveState.favorites.findIndex(
      (fav) => fav.id === pokemon.id
    );
    if (index > -1) {
      reactiveState.favorites.splice(index, 1);
    } else {
      reactiveState.favorites.push(pokemon);
    }
  },

  setCurrentPokemon(pokemon) {
    reactiveState.currentPokemon = pokemon;
  },

  subscribe(fn) {
    listeners.add(fn);
    fn(reactiveState); // Llama inmediatamente con estado mergeado
    return () => listeners.delete(fn);
  },

  unsubscribe(fn) {
    listeners.delete(fn);
  },

  reset() {
    internalState = { ...DEFAULT_STATE };
    persist();
    notifyListeners();
  },
};

// Exports individuales (mismos)
export function getState() {
  return globalState.getState();
}
export function setState(partial) {
  globalState.setState(partial);
}
export function incrementCounter() {
  globalState.incrementCounter();
}
export function decrementCounter() {
  globalState.decrementCounter();
}
export function subscribe(fn) {
  return globalState.subscribe(fn);
}
