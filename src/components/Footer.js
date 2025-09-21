const Footer = {
  render() {
    const year = new Date().getFullYear();
    return `
      <footer class="border-t border-steel py-6">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-soft text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© ${year} Pokémon-Ai. Hecho por Hector Encarnacion</p>
          <p>
            Datos de Pokémon por
            <a href="https://pokeapi.co" target="_blank" rel="noreferrer" class="text-neon hover:underline">PokeAPI</a>
          </p>
        </div>
      </footer>
    `;
  },
};

export default Footer;
