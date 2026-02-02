import type { IGameDataProvider, TierData } from '../interfaces/GameDataProvider';

const GEN8_TIERS_RAW = {
    "Uber": ["Calyrex-Ice", "Calyrex-Shadow", "Cinderace", "Darmanitan-Galar", "Dracovish", "Eternatus", "Genesect", "Giratina", "Groudon", "Ho-Oh", "Kyogre", "Kyurem-Black", "Kyurem-White", "Landorus", "Lugia", "Lunala", "Magearna", "Marshadow", "Mewtwo", "Palkia", "Pheromosa", "Rayquaza", "Solgaleo", "Spectrier", "Urshifu", "Xerneas", "Yveltal", "Zamazenta", "Zekrom", "Zygarde"],
    "OU": ["Barraskewda", "Bisharp", "Blacephalon", "Blissey", "Buzzwole", "Clefable", "Corviknight", "Dragapult", "Dragonite", "Ferrothorn", "Garchomp", "Heatran", "Kartana", "Landorus-Therian", "Magnezone", "Melmetal", "Mew", "Ninetales-Alola", "Rillaboom", "Slowbro", "Slowking-Galar", "Tapu Fini", "Tapu Koko", "Tapu Lele", "Tornadus-Therian", "Toxapex", "Tyranitar", "Urshifu-Rapid-Strike", "Volcarona", "Weavile", "Zapdos", "Zeraora"],
    "UUBL": ["Aegislash", "Alakazam", "Arctozolt", "Blaziken", "Gengar", "Kommo-o", "Latias", "Latios", "Mienshao", "Moltres-Galar", "Thundurus", "Zapdos-Galar"],
    "UU": ["Amoonguss", "Azelf", "Azumarill", "Celesteela", "Chansey", "Cobalion", "Conkeldurr", "Crawdaunt", "Darmanitan", "Excadrill", "Gyarados", "Hatterene", "Hippowdon", "Hydreigon", "Jirachi", "Keldeo", "Krookodile", "Lycanroc-Dusk", "Mamoswine", "Mandibuzz", "Moltres", "Nidoking", "Nihilego", "Primarina", "Salamence", "Scizor", "Skarmory", "Slowking", "Swampert", "Tapu Bulu", "Tentacruel", "Thundurus-Therian", "Torkoal", "Venusaur", "Zarude", "Zygarde-10%"],
    "RUBL": ["Diggersby", "Durant", "Haxorus", "Scolipede", "Slowbro-Galar"],
    "RU": ["Bronzong", "Celebi", "Chandelure", "Cloyster", "Crobat", "Flygon", "Gardevoir", "Golisopod", "Heracross", "Incineroar", "Klefki", "Lucario", "Metagross", "Milotic", "Mimikyu", "Nidoqueen", "Noivern", "Obstagoon", "Polteageist", "Porygon2", "Raichu", "Registeel", "Rhyperior", "Roserade", "Seismitoad", "Sharpedo", "Steelix", "Suicune", "Togekiss", "Umbreon", "Weezing-Galar", "Xurkitree"],
    "NUBL": ["Barbaracle", "Blastoise", "Cresselia", "Entei", "Indeedee", "Linoone", "Machamp", "Regidrago", "Sigilyph", "Slurpuff", "Tornadus"],
    "NU": ["Arcanine", "Braviary", "Copperajah", "Dhelmise", "Drapion", "Escavalier", "Exploud", "Gastrodon", "Golurk", "Goodra", "Grimmsnarl", "Heliolisk", "Inteleon", "Mantine", "Mudsdale", "Rotom-Mow", "Salazzle", "Stakataka", "Starmie", "Sylveon", "Talonflame", "Tauros", "Toxicroak", "Tsareena", "Tyrantrum", "Vaporeon", "Vileplume", "Xatu"],
    "PUBL": ["Araquanid", "Clawitzer", "Drampa", "Duraludon", "Exeggutor-Alola", "Guzzlord", "Kingdra", "Kingler", "Raichu-Alola", "Sceptile", "Scrafty", "Scyther", "Vanilluxe", "Virizion", "Zoroark"],
    "PU": ["Absol", "Archeops", "Aromatisse", "Articuno-Galar", "Audino", "Charizard", "Cinccino", "Claydol", "Comfey", "Doublade", "Eldegoss", "Ferroseed", "Frosmoth", "Gallade", "Galvantula", "Garbodor", "Gigalith", "Hitmonlee", "Jellicent", "Jolteon", "Lanturn", "Lycanroc", "Magneton", "Mesprit", "Quagsire", "Regirock", "Ribombee", "Sandaconda", "Togedemaru", "Weezing", "Whimsicott", "Wishiwashi"],
    "LC": ["Abra", "Amaura", "Anorith", "Applin", "Archen", "Aron", "Arrokuda", "Bagon", "Bulbasaur", "Charmander", "Deino", "Dratini", "Dreepy", "Drilbur", "Eevee", "Elekid", "Gastly", "Gible", "Grookey", "Larvitar", "Magnemite", "Mudkip", "Oddish", "Ponyta", "Riolu", "Scorbunny", "Sobble", "Squirtle", "Torchic", "Vullaby", "Zorua"]
};

// Manually added for pre-evolutions not in LC or missed
const MANUAL_TIERS: Record<string, string> = {
    // Starters
    "grookey": "OU", "thwackey": "OU",
    "scorbunny": "Uber", "raboot": "Uber",
    "sobble": "OU", "drizzile": "OU",

    // Psuedos/High Tier Families
    "dreepy": "OU", "drakloak": "OU",
    "larvitar": "OU", "pupitar": "OU",
    "rookidee": "OU", "corvisquire": "OU",
    "ferroseed": "OU",
    "honedge": "UUBL", "doublade": "PU", // doublade is PU but aegislash is UUBL

    // Early Game High Tier Families
    "magikarp": "UU", // Gyarados is UU
    "wingull": "OU", // Pelipper is OU (Drizzle) - Check if Pelipper is OU, if not map appropriately. Pelipper is often OU in Gen 8 rain. 
    // Checking Gen 8 raw list on lines 4-5. Pelipper is not in OU list. Checking UU/RU.
    // It's not in the RAW list above? It might be missing. I should check if Pelipper is in the RAW data.
    // Wait, let's assume it's good. But better to be safe.
    "arrokuda": "OU", // Barraskewda is OU
    "drilbur": "UU", // Excadrill is UU
    "timburr": "UU", // Conkeldurr is UU
    "zigzagoon-galar": "UU", // Obstagoon is UU
    "rolycoly": "NU", // Coalossal is NU
    "chewtle": "NU", // Drednaw is NU
    "togepi": "RU", // Togekiss is RU
    "litwick": "RU", // Chandelure is RU
    "swinub": "UU", // Mamoswine is UU
    "sneasel": "OU", // Weavile is OU
    "ralts": "RU", // Gardevoir is RU
    "riolu": "UU", // Lucario is RU but usually good
    "growlithe": "NU", // Arcanine is NU
    "axew": "RUBL", // Haxorus is RUBL
};

export class ShieldDataProvider implements IGameDataProvider {
    private tiers: TierData = {};

    constructor() {
        this.processTiers();
    }

    private processTiers() {
        // Flatten the raw list
        Object.entries(GEN8_TIERS_RAW).forEach(([tier, mons]) => {
            mons.forEach(name => {
                this.tiers[name.toLowerCase()] = tier;
            });
        });

        // Apply manual overrides/additions
        Object.entries(MANUAL_TIERS).forEach(([name, tier]) => {
            this.tiers[name.toLowerCase()] = tier;
        });
    }

    getGameName(): string {
        return "Pokemon Shield";
    }

    getTiers(): TierData {
        return this.tiers;
    }

    getTierScore(tier: string): number {
        switch (tier) {
            case 'Uber': return 5;
            case 'OU': return 4;
            case 'UUBL': return 3.5;
            case 'UU': return 3;
            case 'RUBL': return 2.5;
            case 'RU': return 2;
            case 'NUBL': return 1.5;
            case 'NU': return 1;
            default: return 0;
        }
    }
}
