import type { GymLeader } from "../types/pokemon";

export const GYM_LEADERS: GymLeader[] = [
    {
        id: "milo",
        name: "Milo",
        type: "Grass",
        ace: "Eldegoss",
        levelCap: 25,
        badgeId: 1,
        description: "Use Fire, Flying, or Bug types."
    },
    {
        id: "nessa",
        name: "Nessa",
        type: "Water",
        ace: "Drednaw",
        levelCap: 30,
        badgeId: 2,
        description: "Use Electric or Grass types."
    },
    {
        id: "kabu",
        name: "Kabu",
        type: "Fire",
        ace: "Centiskorch",
        levelCap: 35,
        badgeId: 3,
        description: "Use Water, Ground, or Rock types."
    },
    {
        id: "allister",
        name: "Allister",
        type: "Ghost",
        ace: "Gengar",
        levelCap: 40,
        badgeId: 4,
        description: "Exclusive to Shield. Use Ghost or Dark types."
    },
    {
        id: "opal",
        name: "Opal",
        type: "Fairy",
        ace: "Alcremie",
        levelCap: 45,
        badgeId: 5,
        description: "Use Poison or Steel types."
    },
    {
        id: "melony",
        name: "Melony",
        type: "Ice",
        ace: "Lapras",
        levelCap: 50,
        badgeId: 6,
        description: "Exclusive to Shield. Use Fire, Fighting, Rock, or Steel types."
    },
    {
        id: "piers",
        name: "Piers",
        type: "Dark",
        ace: "Obstagoon",
        levelCap: 55,
        badgeId: 7,
        description: "Use Fighting, Bug, or Fairy types."
    },
    {
        id: "raihan",
        name: "Raihan",
        type: "Dragon",
        ace: "Duraludon",
        levelCap: 100, // Final badge allows catching everything
        badgeId: 8,
        description: "Use Ice, Dragon, or Fairy types."
    }
];
