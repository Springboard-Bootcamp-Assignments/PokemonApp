class PokemonApp {
  constructor() {
    this.baseUrl = "https://pokeapi.co/api/v2";
    this.$btn = $("button");
    this.getAllPokemon();
    this.$btn.on("click", () => this.catchEmAll(3));
  }

  async getAllPokemon() {
    const res = await axios.get(`${this.baseUrl}/pokemon/?limit=1000`);
    this.allPokemon = res.data.results;
  }

  async pickRandomPokemon(qty) {
    const allPokemon = this.allPokemon;
    let randomPokemonUrl = [];

    for (let i = 0; i < qty; i++) {
      let randomIdx = Math.floor(Math.random() * allPokemon.length);
      let url = allPokemon.splice(randomIdx, 1)[0].url;
      randomPokemonUrl.push(url);
    }

    let pokemonData = await Promise.all(
      randomPokemonUrl.map((url) => axios.get(url))
    );
    pokemonData.forEach((pokemon) => console.log(pokemon));
    return pokemonData;
  }

  async getRandomPokemonDescription(qty) {
    const pokemonData = await this.pickRandomPokemon(qty);
    const speciesData = await Promise.all(
      pokemonData.map((pokemon) => axios.get(pokemon.data.species.url))
    );
    const descriptions = await Promise.all(
      speciesData.map((description) => {
        let descriptionObj = description.data.flavor_text_entries.find(
          (entry) => entry.language.name == "en"
        );
        return descriptionObj
          ? descriptionObj.flavor_text
          : "No description available.";
      })
    );
    descriptions.forEach((description, i) => {
      console.log(`${pokemonData[i].data.name}: ${description}`);
    });
  }

  async catchEmAll(qty) {
    $("#pokemon-area").empty();
    const pokemonData = await this.pickRandomPokemon(qty);
    const speciesData = await Promise.all(
      pokemonData.map((pokemon) => axios.get(pokemon.data.species.url))
    );

    speciesData.forEach((desc, i) => {
      let descriptionObj = desc.data.flavor_text_entries.find(
        (entry) => entry.language.name == "en"
      );
      let description = descriptionObj ? descriptionObj.flavor_text : "";
      let name = pokemonData[i].data.name;
      let imgSrc = pokemonData[i].data.sprites.front_default;
      $("#pokemon-area").append(this.makePokeCard(name, imgSrc, description));
    });
  }

  makePokeCard(name, imgSrc, description) {
    return `
    <div class="card">
      <h1>${name}</h1>
      <img src=${imgSrc} />
      <p>${description}</p>
    </div>
  `;
  }
}

$("document").ready(() => (app = new PokemonApp()));
