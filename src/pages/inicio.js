// Imports estáticos para que Vite los resuelva correctamente (lazy-load via router)
import * as tf from "@tensorflow/tfjs";
import * as mobilenetModule from "@tensorflow-models/mobilenet";

// Carga perezosa del modelo (se ejecuta solo al clasificar)
let mobilenetModel = null;

// Cache de último ObjectURL para limpiar memoria
let currentObjectUrl = null;

async function ensureModel() {
  if (mobilenetModel) return mobilenetModel;
  await tf.ready(); // Asegura backend (webgl por defecto si disponible)
  mobilenetModel = await mobilenetModule.load({ version: 2, alpha: 1.0 });
  return mobilenetModel;
}

function percent(n) {
  return (n * 100).toFixed(1) + "%";
}

function mapAnimalLabelsToPokemon(predictions) {
  // Extrae etiquetas en minúsculas
  const labels = predictions.map((p) => p.className.toLowerCase());

  const has = (words) => labels.some((l) => words.some((w) => l.includes(w)));

  // Mapeos por palabras clave (heurísticos, expande según necesites)
  if (has(["cat", "kitten", "egyptian cat", "tabby"])) {
    return ["meowth", "espurr", "litten", "skitty"];
  }
  if (has(["dog", "puppy", "retriever", "shepherd", "pug"])) {
    return ["growlithe", "rockruff", "yamper", "eevee"];
  }
  if (has(["bird", "sparrow", "finch"])) {
    return ["pidgey", "starly", "fletchling", "taillow"];
  }
  if (has(["horse", "pony"])) {
    return ["ponyta", "mudsdale", "rapidash"];
  }
  if (has(["cow", "ox", "bull"])) {
    return ["miltank", "tauros"];
  }
  if (has(["sheep", "lamb"])) {
    return ["wooloo", "mareep"];
  }
  if (has(["goat"])) {
    return ["gogoat", "skiddo"];
  }
  if (has(["fox"])) {
    return ["vulpix", "nickit", "zorua"];
  }
  if (has(["wolf"])) {
    return ["lycanroc", "zacian"];
  }
  if (has(["lion"])) {
    return ["litleo", "pyroar", "luxray"];
  }
  if (has(["tiger"])) {
    return ["incineroar", "raikou"];
  }
  if (has(["bear"])) {
    return ["teddiursa", "ursaring", "bewear"];
  }
  if (has(["rabbit", "hare"])) {
    return ["buneary", "lopunny", "scorbunny"];
  }
  if (has(["monkey", "ape", "chimpanzee", "gorilla"])) {
    return ["aipom", "grookey", "passimian", "rillaboom"];
  }
  if (has(["mouse", "rat", "hamster"])) {
    return ["pikachu", "rattata", "dedenne", "pachirisu"];
  }
  if (has(["elephant"])) {
    return ["phanpy", "donphan", "copperajah"];
  }
  if (has(["panda"])) {
    return ["pancham", "pangoro"];
  }
  if (has(["penguin"])) {
    return ["piplup", "empoleon", "eiscue"];
  }
  if (has(["duck", "goose", "swan"])) {
    return ["psyduck", "quaxly", "ducklett"];
  }
  if (has(["chicken", "rooster", "hen"])) {
    return ["torchic", "combusken", "blaziken"];
  }
  if (has(["lizard", "gecko", "iguana"])) {
    return ["treecko", "grovyle", "charmeleon"];
  }
  if (has(["snake", "cobra", "viper"])) {
    return ["ekans", "arbok", "seviper"];
  }
  if (has(["turtle", "tortoise"])) {
    return ["squirtle", "torkoal", "tirtouga"];
  }
  if (has(["crocodile", "alligator"])) {
    return ["totodile", "krokorok", "krookodile"];
  }
  if (has(["frog", "toad"])) {
    return ["froakie", "politoed", "croagunk"];
  }
  if (has(["fish", "goldfish"])) {
    return ["magikarp", "goldeen", "finneon", "wishiwashi"];
  }
  if (has(["shark"])) {
    return ["sharpedo"];
  }
  if (has(["dolphin"])) {
    return ["finizen", "palafin"];
  }
  if (has(["whale"])) {
    return ["wailmer", "wailord"];
  }
  if (has(["bat"])) {
    return ["zubat", "noibat"];
  }
  if (has(["owl"])) {
    return ["hoothoot", "rowlet"];
  }
  if (has(["eagle", "falcon", "hawk"])) {
    return ["braviary", "talonflame"];
  }
  if (has(["parrot"])) {
    return ["chatot", "squawkabilly"];
  }
  if (has(["spider"])) {
    return ["spinarak", "joltik"];
  }
  if (has(["butterfly", "moth"])) {
    return ["butterfree", "vivillon", "mothim"];
  }
  if (has(["bee", "wasp"])) {
    return ["beedrill", "vespiquen", "combee"];
  }
  if (has(["ant"])) {
    return ["durant"];
  }
  if (has(["crab", "lobster"])) {
    return ["krabby", "kingler", "corphish", "clawitzer"];
  }
  if (has(["seal", "sea lion"])) {
    return ["seel", "dewgong", "popplio"];
  }
  if (has(["otter"])) {
    return ["oshawott", "buizel"];
  }
  if (has(["deer"])) {
    return ["stantler", "deerling", "sawsbuck"];
  }
  if (has(["boar", "pig"])) {
    return ["emboar", "grumpig", "lechonk"];
  }
  if (has(["raccoon"])) {
    return ["zigzagoon", "obstagoon"];
  }
  if (has(["skunk"])) {
    return ["stunky", "skuntank"];
  }
  if (has(["squirrel"])) {
    return ["pachirisu", "skwovet", "greedent"];
  }
  if (has(["hedgehog"])) {
    return ["shaymin"];
  }
  if (has(["hippopotamus", "hippo"])) {
    return ["hippopotas", "hippowdon"];
  }
  if (has(["rhinoceros", "rhino"])) {
    return ["rhyhorn", "rhydon", "rhyperior"];
  }
  if (has(["camel"])) {
    return ["camerupt"];
  }
  if (has(["koala"])) {
    return ["komala"];
  }
  if (has(["kangaroo"])) {
    return ["kangaskhan"];
  }

  // Fallback general
  return ["eevee", "ditto", "pikachu"];
}

async function findPokemonData(candidates) {
  const names = Array.from(new Set(candidates.map((n) => n.toLowerCase())));
  for (const name of names) {
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Sigue al siguiente
    }
  }
  // Fallback a Ditto
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderPredictionList(predictions) {
  if (!predictions || predictions.length === 0)
    return '<p class="text-soft">Sin resultados.</p>';
  return `
    <ul class="space-y-2">
      ${predictions
        .slice(0, 5)
        .map(
          (p) => `
        <li class="flex items-center justify-between bg-ink/40 border border-steel rounded-md px-3 py-2">
          <span class="text-sm">${p.className}</span>
          <span class="text-neon font-semibold">${percent(p.probability)}</span>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

function renderPokemonCard(pokemon) {
  if (!pokemon) {
    return `
      <div class="p-4 border border-steel rounded-lg bg-ink/40">
        <p class="text-soft">No se pudo obtener información del Pokémon.</p>
      </div>
    `;
  }
  const art =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.other?.dream_world?.front_default ||
    pokemon.sprites?.front_default;
  const types =
    pokemon.types
      ?.map(
        (t) =>
          `<span class="px-2 py-1 rounded bg-steel text-xs">${capitalize(
            t.type.name
          )}</span>`
      )
      .join(" ") || "desconocido";
  return `
    <div class="p-4 border border-steel rounded-lg bg-ink/40 flex flex-col sm:flex-row gap-4 items-center">
      <img src="${art}" alt="${
    pokemon.name
  }" class="w-40 h-40 object-contain drop-shadow-lg glow" onerror="this.src='https://via.placeholder.com/160?text=?'" />
      <div class="flex-1">
        <h3 class="text-xl font-semibold mb-1">${capitalize(
          pokemon.name
        )} <span class="text-soft">#${pokemon.id}</span></h3>
        <p class="mb-2 text-soft">Tipos: ${types}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          ${(pokemon.stats || [])
            .map(
              (s) => `
            <div class="bg-steel/40 rounded p-2">
              <div class="text-soft text-xs">${capitalize(
                s.stat.name.replace("-", " ")
              )}</div>
              <div class="text-white font-semibold">${s.base_stat}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

async function classifyImage(imgEl) {
  try {
    const model = await ensureModel();
    const predictions = await model.classify(imgEl, 5);
    return predictions;
  } catch (error) {
    console.error("Error en clasificación:", error);
    throw new Error(
      "No se pudo clasificar la imagen. Verifica que sea una imagen válida."
    );
  }
}

async function handleClassify() {
  const imgEl = document.getElementById("previewImg");
  const resultsEl = document.getElementById("results");

  if (!imgEl || !imgEl.src || imgEl.src === window.location.href) {
    resultsEl.innerHTML = `
      <div class="text-center text-red-400 p-4">
        <p>Por favor, selecciona una imagen primero.</p>
      </div>
    `;
    return;
  }

  resultsEl.innerHTML = `
    <div class="text-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neon mx-auto mb-2"></div>
      <p class="text-soft">Clasificando imagen...</p>
    </div>
  `;

  try {
    // Clasificar imagen
    const predictions = await classifyImage(imgEl);

    // Mapear a Pokémon
    const pokemonCandidates = mapAnimalLabelsToPokemon(predictions);
    const pokemonData = await findPokemonData(pokemonCandidates);

    // Renderizar resultados
    resultsEl.innerHTML = `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-3 text-neon">Predicciones de IA:</h3>
          ${renderPredictionList(predictions)}
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-3 text-neon">Pokémon Sugerido:</h3>
          ${renderPokemonCard(pokemonData)}
        </div>
      </div>
    `;
  } catch (error) {
    resultsEl.innerHTML = `
      <div class="text-center text-red-400 p-4">
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Limpiar ObjectURL anterior
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    document.getElementById("results").innerHTML = `
      <div class="text-center text-red-400 p-4">
        <p>Por favor, selecciona un archivo de imagen válido.</p>
      </div>
    `;
    return;
  }

  // Crear ObjectURL y mostrar preview
  currentObjectUrl = URL.createObjectURL(file);
  const imgEl = document.getElementById("previewImg");
  const previewContainer = document.getElementById("previewContainer");

  imgEl.src = currentObjectUrl;
  imgEl.onload = () => {
    previewContainer.classList.remove("hidden");
    document.getElementById("classifyBtn").disabled = false;
  };

  // Limpiar resultados anteriores
  document.getElementById("results").innerHTML = "";
}

// Clase principal de la página
export class InicioPage {
  constructor() {
    this.eventListeners = [];
  }

  render() {
    return `
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent mb-4">
            🤖 Pokémon AI Classifier
          </h1>
          <p class="text-gray-400 text-lg">
            Sube una imagen de un animal y descubre qué Pokémon se parece más
          </p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Upload Section -->
          <div class="bg-card-bg border border-border-neon rounded-lg p-6 mb-6">
            <div class="text-center">
              <div class="mb-4">
                <label for="fileInput" class="cursor-pointer inline-block bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
                  📁 Seleccionar Imagen
                </label>
                <input 
                  type="file" 
                  id="fileInput" 
                  accept="image/*" 
                  class="hidden"
                />
              </div>
              <p class="text-gray-400 text-sm">
                Formatos soportados: JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>

          <!-- Preview Section -->
          <div id="previewContainer" class="hidden bg-card-bg border border-border-neon rounded-lg p-6 mb-6">
            <div class="text-center">
              <img 
                id="previewImg" 
                class="max-w-full max-h-64 mx-auto rounded-lg shadow-lg mb-4" 
                alt="Preview"
              />
              <button 
                id="classifyBtn" 
                disabled 
                class="bg-gradient-to-r from-neon-purple to-neon-blue px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 Clasificar Imagen
              </button>
            </div>
          </div>

          <!-- Results Section -->
          <div id="results" class="bg-card-bg border border-border-neon rounded-lg p-6">
            <div class="text-center text-gray-400">
              <div class="text-6xl mb-4">🎯</div>
              <p>Los resultados aparecerán aquí después de clasificar una imagen</p>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="max-w-4xl mx-auto mt-8">
          <div class="bg-card-bg border border-border-neon rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4 text-neon-blue">¿Cómo funciona?</h3>
            <div class="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div class="text-center">
                <div class="text-2xl mb-2">🖼️</div>
                <h4 class="font-semibold mb-1">1. Sube una imagen</h4>
                <p>Selecciona una foto de cualquier animal</p>
              </div>
              <div class="text-center">
                <div class="text-2xl mb-2">🤖</div>
                <h4 class="font-semibold mb-1">2. IA la analiza</h4>
                <p>MobileNet identifica características del animal</p>
              </div>
              <div class="text-center">
                <div class="text-2xl mb-2">⚡</div>
                <h4 class="font-semibold mb-1">3. Encuentra tu Pokémon</h4>
                <p>Te mostramos el Pokémon más similar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  afterRender() {
    // Attach event listeners
    const fileInput = document.getElementById("fileInput");
    const classifyBtn = document.getElementById("classifyBtn");

    if (fileInput) {
      const fileHandler = (e) => handleFileSelect(e);
      fileInput.addEventListener("change", fileHandler);
      this.eventListeners.push({
        element: fileInput,
        event: "change",
        handler: fileHandler,
      });
    }

    if (classifyBtn) {
      const classifyHandler = () => handleClassify();
      classifyBtn.addEventListener("click", classifyHandler);
      this.eventListeners.push({
        element: classifyBtn,
        event: "click",
        handler: classifyHandler,
      });
    }
  }

  destroy() {
    // Clean up event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Clean up ObjectURL
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  }
}

// Export default instance
export default new InicioPage();
