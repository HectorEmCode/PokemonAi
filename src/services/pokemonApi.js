class PokemonAPI {
  constructor() {
    this.baseURL = "https://pokeapi.co/api/v2";
    this.cache = new Map();
  }

  async fetchPokemonList(limit = 20, offset = 0) {
    try {
      const response = await fetch(
        `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`
      );
      const data = await response.json();

      const pokemonDetails = await Promise.all(
        data.results.map((pokemon) => this.fetchPokemonByUrl(pokemon.url))
      );

      return {
        results: pokemonDetails,
        count: data.count,
        totalPages: Math.ceil(data.count / limit),
      };
    } catch (error) {
      console.error("Error fetching Pokemon list:", error);
      return { results: [], count: 0, totalPages: 0 };
    }
  }

  async fetchPokemonByUrl(url) {
    try {
      const response = await fetch(url);
      const pokemon = await response.json();

      return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default,
        types: pokemon.types.map((type) => type.type.name),
        height: pokemon.height / 10,
        weight: pokemon.weight / 10,
        stats: pokemon.stats.map((stat) => ({
          name: stat.stat.name,
          value: stat.base_stat,
        })),
        abilities: pokemon.abilities.map((ability) => ability.ability.name),
      };
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      return null;
    }
  }

  getTypeColor(type) {
    const colors = {
      normal: "#A8A878",
      fire: "#F08030",
      water: "#6890F0",
      electric: "#F8D030",
      grass: "#78C850",
      ice: "#98D8D8",
      fighting: "#C03028",
      poison: "#A040A0",
      ground: "#E0C068",
      flying: "#A890F0",
      psychic: "#F85888",
      bug: "#A8B820",
      rock: "#B8A038",
      ghost: "#705898",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      fairy: "#EE99AC",
    };
    return colors[type] || "#68A090";
  }
}

export const pokemonAPI = new PokemonAPI();
