import type { PokemonType } from "../types/pokemon";

export interface SimplePokemon {
    name: string;
    types: PokemonType[];
    location?: string;
    minBadge?: number;
    note?: string; // e.g. "Evolves into..."
}

export const SUGGESTION_POOL: SimplePokemon[] = [
    // Early Game (Route 1-3, Wild Area)
    { name: "Rookidee", types: ["Flying"], minBadge: 0, note: "Evolves into Corviknight (Steel/Flying)" },
    { name: "Wingull", types: ["Water", "Flying"], minBadge: 0, note: "Evolves into Pelipper (Drizzle)" },
    { name: "Arrokuda", types: ["Water"], minBadge: 1, note: "Evolves into Barraskewda" },
    { name: "Timburr", types: ["Fighting"], minBadge: 1, note: "Evolves into Conkeldurr" },
    { name: "Wooloo", types: ["Normal"], minBadge: 0 },
    { name: "Chewtle", types: ["Water"], minBadge: 0, note: "Evolves into Drednaw (Water/Rock)" },
    { name: "Rolycoly", types: ["Rock"], minBadge: 1, note: "Evolves into Coalossal (Rock/Fire)" },
    { name: "Yamper", types: ["Electric"], minBadge: 0, note: "Evolves into Boltund" },
    { name: "Toxel", types: ["Electric", "Poison"], minBadge: 2, note: "Evolves into Toxtricity" },
    { name: "Sizzlipede", types: ["Fire", "Bug"], minBadge: 3, note: "Evolves into Centiskorch" },
    { name: "Impidimp", types: ["Dark", "Fairy"], minBadge: 4, location: "Glimwood Tangle" }, // Impidimp is Glimwood (Badge 4ish)
    { name: "Hatenna", types: ["Psychic"], minBadge: 4, location: "Glimwood Tangle" }, // Hatenna is also Glimwood

    // Shield Exclusives / Rares
    { name: "Galarian Ponyta", types: ["Psychic"], location: "Glimwood Tangle", minBadge: 4 },
    { name: "Applin", types: ["Grass", "Dragon"], minBadge: 0, note: "Evolves into Appletun" },
    { name: "Galarian Corsola", types: ["Ghost"], minBadge: 4 },
    { name: "Larvitar", types: ["Rock", "Ground"], minBadge: 8, location: "Lake of Outrage" }, // Shield exclusive, late game
    { name: "Goomy", types: ["Dragon"], minBadge: 8, location: "Lake of Outrage" },
    { name: "Solosis", types: ["Psychic"], minBadge: 5 },
    { name: "Vullaby", types: ["Dark", "Flying"], minBadge: 5 },

    // Gap Fillers (Strong Types)
    { name: "Drilbur", types: ["Ground"], minBadge: 1, note: "Evolves into Excadrill" }, // Galar Mine is early
    { name: "Shellos", types: ["Water", "Ground"], minBadge: 1, note: "Evolves into Gastrodon" },
    { name: "Magikarp", types: ["Water"], minBadge: 0, note: "Evolves into Gyarados" },
    { name: "Growlithe", types: ["Fire"], minBadge: 2, note: "Evolves into Arcanine" },
    { name: "Riolu", types: ["Fighting"], minBadge: 3, note: "Evolves into Lucario" },
    { name: "Togepi", types: ["Fairy"], minBadge: 3, note: "Evolves into Togekiss" },
    { name: "Dreepy", types: ["Dragon", "Ghost"], minBadge: 8, location: "Lake of Outrage" },
    { name: "Axew", types: ["Dragon"], minBadge: 6 },
    { name: "Ralts", types: ["Psychic", "Fairy"], minBadge: 3 }, // Gallade/Gardevoir
    { name: "Swinub", types: ["Ice", "Ground"], minBadge: 6 }, // Mamoswine
    { name: "Sneasel", types: ["Dark", "Ice"], minBadge: 6 }, // Weavile
    { name: "Ferroseed", types: ["Grass", "Steel"], minBadge: 4 }, // Ferrothorn
    { name: "Honedge", types: ["Steel", "Ghost"], minBadge: 4 }, // Aegislash
    { name: "Galarian Zigzagoon", types: ["Dark", "Normal"], minBadge: 0, note: "Evolves into Obstagoon" }
];

// Manual location overrides for when API data is missing (common in Gen 8)
export const MANUAL_LOCATIONS: Record<string, string> = {
    "scorbunny": "Starter Pokemon (Postwick)",
    "sobble": "Starter Pokemon (Postwick)",
    "grookey": "Starter Pokemon (Postwick)",
    "rookidee": "Route 1, Route 2, Route 3",
    "corviknight": "Route 7, Lake of Outrage",
    "wooloo": "Route 1, Route 4",
    "dubwool": "Route 7, Dusty Bowl",
    "chewtle": "Route 2, Route 4, Route 5",
    "drednaw": "Route 2, Route 6, Bridge Field",
    "yamper": "Route 2, Route 4",
    "boltund": "Route 9, Lake of Outrage",
    "rolycoly": "Route 3, Galar Mine",
    "carkol": "Galar Mine No. 2, Bridge Field",
    "coalossal": "Giant's Cap, Lake of Outrage",
    "applin": "Route 5, Stony Wilderness",
    "flapple": "Evolution (Tart Apple)",
    "appletun": "Evolution (Sweet Apple)",
    "silicobra": "Route 6",
    "sandaconda": "Route 8, Lake of Outrage",
    "cramorant": "Route 9, Bridge Field",
    "arrokuda": "Route 2, Route 2 (Fishing)",
    "barraskewda": "Route 2 (Fishing), Lake of Outrage",
    "wingull": "Wild Area (Rolling Fields)",
    "pelipper": "Wild Area (Rolling Fields)",
    "timburr": "Galar Mine",
    "conkeldurr": "Motostoke Riverbank",
    "shellos": "Galar Mine No. 2",
    "gastrodon": "Route 9",
    "toxel": "Route 7, Bridge Field",
    "toxtricity": "Evolution (Level 30)",
    "sizzlipede": "Route 3, Galar Mine No. 2",
    "centiskorch": "Route 9, Lake of Outrage",
    "clobbopus": "Route 9",
    "grapploct": "Route 9 (Water)",
    "sinistea": "Glimwood Tangle",
    "polteageist": "Evolution (Cracked Pot)",
    "hatenna": "Motostoke Outskirts",
    "hattrem": "Glimwood Tangle",
    "hatterene": "Lake of Outrage",
    "impidimp": "Glimwood Tangle",
    "morgrem": "Glimwood Tangle",
    "grimmsnarl": "Lake of Outrage",
    "milcery": "Route 4",
    "alcremie": "Evolution (Sweet)",
    "falinks": "Route 8, Lake of Outrage",
    "pincurchin": "Route 9",
    "snom": "Route 8, Route 10",
    "frosmoth": "Evolution (Friendship + Night)",
    "stonjourner": "Route 10, Lake of Outrage (Sword)",
    "eiscue": "Route 10, Lake of Outrage (Shield)",
    "indeedee": "Glimwood Tangle",
    "morpeko": "Route 7, Route 9",
    "cufant": "Bridge Field",
    "copperajah": "Lake of Outrage",
    "dracozolt": "Fossil (Bird + Drake)",
    "arctozolt": "Fossil (Bird + Dino)",
    "dracovish": "Fossil (Fish + Drake)",
    "arctovish": "Fossil (Fish + Dino)",
    "duraludon": "Route 10, Lake of Outrage",
    "dreepy": "Lake of Outrage (Overcast/Thunderstorm)",
    "drakloak": "Lake of Outrage",
    "dragapult": "Evolution (Level 60)",
    "zacian": "Tower Summit (Sword)",
    "zamazenta": "Tower Summit (Shield)",
    "eternatus": "Energy Plant",
};
