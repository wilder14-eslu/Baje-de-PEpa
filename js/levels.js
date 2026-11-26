// 50 Handcrafted and verified solvable levels for Longcat
const LEVELS = [
  {
    "id": 1,
    "name": "El Primer Estiramiento",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado",
    "w": 3,
    "h": 3,
    "walls": [],
    "start": [
      0,
      2
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "U"
    ],
    "moves": 5,
    "walkable": 9
  },
  {
    "w": 3,
    "h": 3,
    "walls": [
      [
        2,
        2
      ]
    ],
    "start": [
      1,
      2
    ],
    "solution": [
      "L",
      "U",
      "R",
      "D",
      "L"
    ],
    "moves": 5,
    "walkable": 8,
    "id": 2,
    "name": "Nivel 2",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 3,
    "h": 3,
    "walls": [
      [
        0,
        2
      ]
    ],
    "start": [
      2,
      0
    ],
    "solution": [
      "D",
      "L",
      "U",
      "L",
      "D"
    ],
    "moves": 5,
    "walkable": 8,
    "id": 3,
    "name": "Nivel 3",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 3,
    "walls": [],
    "start": [
      2,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "D",
      "R"
    ],
    "moves": 7,
    "walkable": 12,
    "id": 4,
    "name": "Nivel 4",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 3,
    "walls": [
      [
        1,
        1
      ]
    ],
    "start": [
      2,
      1
    ],
    "solution": [
      "U",
      "L",
      "D",
      "R",
      "U"
    ],
    "moves": 5,
    "walkable": 11,
    "id": 5,
    "name": "Nivel 5",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 3,
    "h": 4,
    "walls": [
      [
        2,
        3
      ]
    ],
    "start": [
      2,
      2
    ],
    "solution": [
      "U",
      "L",
      "D",
      "R",
      "U"
    ],
    "moves": 5,
    "walkable": 11,
    "id": 6,
    "name": "Nivel 6",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 3,
    "walls": [
      [
        3,
        2
      ],
      [
        1,
        1
      ]
    ],
    "start": [
      0,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "D",
      "L",
      "U"
    ],
    "moves": 6,
    "walkable": 10,
    "id": 7,
    "name": "Nivel 7",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 4,
    "walls": [
      [
        2,
        2
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "R",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R"
    ],
    "moves": 7,
    "walkable": 15,
    "id": 8,
    "name": "Nivel 8",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 4,
    "walls": [
      [
        0,
        1
      ],
      [
        2,
        2
      ]
    ],
    "start": [
      0,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "U",
      "R"
    ],
    "moves": 7,
    "walkable": 14,
    "id": 9,
    "name": "Nivel 9",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 4,
    "walls": [
      [
        1,
        1
      ],
      [
        3,
        0
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "R",
      "U",
      "L",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R"
    ],
    "moves": 9,
    "walkable": 14,
    "id": 10,
    "name": "Nivel 10",
    "world": 1,
    "worldName": "El Jard\u00edn Soleado"
  },
  {
    "w": 4,
    "h": 4,
    "walls": [
      [
        3,
        3
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "L",
      "U",
      "R",
      "D",
      "L",
      "U",
      "R"
    ],
    "moves": 7,
    "walkable": 15,
    "id": 11,
    "name": "Nivel 11",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 4,
    "h": 4,
    "walls": [
      [
        3,
        2
      ],
      [
        3,
        3
      ]
    ],
    "start": [
      0,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "D",
      "R",
      "U",
      "L"
    ],
    "moves": 7,
    "walkable": 14,
    "id": 12,
    "name": "Nivel 12",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 4,
    "walls": [
      [
        4,
        1
      ]
    ],
    "start": [
      2,
      0
    ],
    "solution": [
      "L",
      "D",
      "R",
      "U",
      "L",
      "U",
      "R",
      "U",
      "R"
    ],
    "moves": 9,
    "walkable": 19,
    "id": 13,
    "name": "Nivel 13",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 4,
    "walls": [
      [
        4,
        3
      ],
      [
        3,
        1
      ]
    ],
    "start": [
      1,
      1
    ],
    "solution": [
      "U",
      "L",
      "D",
      "R",
      "U",
      "R",
      "U",
      "L",
      "D",
      "L"
    ],
    "moves": 10,
    "walkable": 18,
    "id": 14,
    "name": "Nivel 14",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 4,
    "h": 5,
    "walls": [
      [
        3,
        4
      ],
      [
        2,
        2
      ]
    ],
    "start": [
      0,
      4
    ],
    "solution": [
      "R",
      "U",
      "R",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R"
    ],
    "moves": 9,
    "walkable": 18,
    "id": 15,
    "name": "Nivel 15",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 4,
    "walls": [
      [
        1,
        0
      ],
      [
        0,
        0
      ],
      [
        3,
        1
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "L",
      "U",
      "R",
      "U",
      "R",
      "D",
      "L",
      "U",
      "L"
    ],
    "moves": 9,
    "walkable": 17,
    "id": 16,
    "name": "Nivel 16",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 4,
    "walls": [
      [
        3,
        0
      ],
      [
        0,
        0
      ],
      [
        0,
        1
      ]
    ],
    "start": [
      4,
      0
    ],
    "solution": [
      "D",
      "L",
      "U",
      "R",
      "U",
      "L",
      "U",
      "R"
    ],
    "moves": 8,
    "walkable": 17,
    "id": 17,
    "name": "Nivel 17",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        3,
        3
      ],
      [
        2,
        2
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "D",
      "R",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R",
      "D"
    ],
    "moves": 9,
    "walkable": 23,
    "id": 18,
    "name": "Nivel 18",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        4,
        2
      ],
      [
        2,
        1
      ],
      [
        1,
        1
      ]
    ],
    "start": [
      3,
      3
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L",
      "D",
      "R"
    ],
    "moves": 11,
    "walkable": 22,
    "id": 19,
    "name": "Nivel 19",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        4,
        0
      ],
      [
        3,
        2
      ],
      [
        4,
        4
      ]
    ],
    "start": [
      3,
      4
    ],
    "solution": [
      "L",
      "U",
      "R",
      "D",
      "R",
      "D",
      "L",
      "U",
      "R",
      "D"
    ],
    "moves": 10,
    "walkable": 22,
    "id": 20,
    "name": "Nivel 20",
    "world": 2,
    "worldName": "La Sala Acogedora"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "start": [
      4,
      3
    ],
    "solution": [
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L",
      "U",
      "R"
    ],
    "moves": 10,
    "walkable": 23,
    "id": 21,
    "name": "Nivel 21",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        1,
        1
      ],
      [
        4,
        2
      ],
      [
        3,
        2
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L",
      "D"
    ],
    "moves": 10,
    "walkable": 22,
    "id": 22,
    "name": "Nivel 22",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        3,
        3
      ],
      [
        0,
        4
      ],
      [
        3,
        1
      ],
      [
        1,
        4
      ]
    ],
    "start": [
      2,
      3
    ],
    "solution": [
      "D",
      "R",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R",
      "D",
      "R"
    ],
    "moves": 10,
    "walkable": 21,
    "id": 23,
    "name": "Nivel 23",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        0,
        4
      ],
      [
        0,
        3
      ],
      [
        2,
        1
      ],
      [
        1,
        1
      ]
    ],
    "start": [
      4,
      2
    ],
    "solution": [
      "D",
      "L",
      "U",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L",
      "U"
    ],
    "moves": 11,
    "walkable": 21,
    "id": 24,
    "name": "Nivel 24",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 6,
    "h": 4,
    "walls": [
      [
        1,
        2
      ],
      [
        2,
        2
      ]
    ],
    "start": [
      2,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "D",
      "R",
      "D",
      "L"
    ],
    "moves": 9,
    "walkable": 22,
    "id": 25,
    "name": "Nivel 25",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        2,
        3
      ],
      [
        1,
        3
      ],
      [
        3,
        0
      ]
    ],
    "start": [
      2,
      2
    ],
    "solution": [
      "L",
      "D",
      "R",
      "U",
      "L",
      "D",
      "L",
      "U",
      "L",
      "U",
      "R"
    ],
    "moves": 11,
    "walkable": 27,
    "id": 26,
    "name": "Nivel 26",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 5,
    "h": 6,
    "walls": [
      [
        4,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ]
    ],
    "start": [
      0,
      5
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "D",
      "R",
      "U",
      "L",
      "D",
      "R"
    ],
    "moves": 10,
    "walkable": 27,
    "id": 27,
    "name": "Nivel 27",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 5,
    "h": 5,
    "walls": [
      [
        3,
        4
      ],
      [
        3,
        2
      ],
      [
        1,
        3
      ],
      [
        4,
        4
      ]
    ],
    "start": [
      4,
      0
    ],
    "solution": [
      "D",
      "L",
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "R"
    ],
    "moves": 10,
    "walkable": 21,
    "id": 28,
    "name": "Nivel 28",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        2,
        2
      ],
      [
        4,
        1
      ],
      [
        3,
        0
      ]
    ],
    "start": [
      4,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "R",
      "U",
      "L",
      "U"
    ],
    "moves": 12,
    "walkable": 27,
    "id": 29,
    "name": "Nivel 29",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        3,
        2
      ],
      [
        5,
        4
      ],
      [
        2,
        0
      ],
      [
        3,
        3
      ]
    ],
    "start": [
      3,
      0
    ],
    "solution": [
      "R",
      "D",
      "L",
      "D",
      "L",
      "U",
      "R",
      "D",
      "R",
      "U",
      "R",
      "D"
    ],
    "moves": 12,
    "walkable": 26,
    "id": 30,
    "name": "Nivel 30",
    "world": 3,
    "worldName": "Los Tejados al Atardecer"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        1,
        3
      ],
      [
        2,
        0
      ],
      [
        3,
        4
      ]
    ],
    "start": [
      1,
      2
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "L",
      "D",
      "L",
      "U",
      "R",
      "D",
      "R",
      "U",
      "L"
    ],
    "moves": 13,
    "walkable": 27,
    "id": 31,
    "name": "Nivel 31",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        0,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        2
      ],
      [
        1,
        2
      ]
    ],
    "start": [
      4,
      1
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "U",
      "R",
      "U",
      "L",
      "U",
      "L",
      "D",
      "R"
    ],
    "moves": 12,
    "walkable": 26,
    "id": 32,
    "name": "Nivel 32",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        5,
        4
      ],
      [
        0,
        2
      ],
      [
        3,
        3
      ],
      [
        2,
        3
      ]
    ],
    "start": [
      3,
      1
    ],
    "solution": [
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L",
      "U",
      "R",
      "U",
      "R",
      "U"
    ],
    "moves": 12,
    "walkable": 26,
    "id": 33,
    "name": "Nivel 33",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        4,
        1
      ],
      [
        2,
        2
      ],
      [
        1,
        4
      ],
      [
        1,
        1
      ],
      [
        0,
        4
      ]
    ],
    "start": [
      1,
      2
    ],
    "solution": [
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "U",
      "R",
      "U",
      "L",
      "U",
      "L"
    ],
    "moves": 12,
    "walkable": 25,
    "id": 34,
    "name": "Nivel 34",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        3,
        5
      ],
      [
        0,
        5
      ],
      [
        2,
        2
      ],
      [
        3,
        4
      ]
    ],
    "start": [
      0,
      4
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R",
      "U"
    ],
    "moves": 11,
    "walkable": 32,
    "id": 35,
    "name": "Nivel 35",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        4,
        4
      ],
      [
        3,
        4
      ],
      [
        0,
        5
      ],
      [
        1,
        5
      ]
    ],
    "start": [
      0,
      0
    ],
    "solution": [
      "D",
      "R",
      "D",
      "R",
      "U",
      "L",
      "D",
      "R",
      "U",
      "L",
      "D",
      "R"
    ],
    "moves": 12,
    "walkable": 32,
    "id": 36,
    "name": "Nivel 36",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        5,
        4
      ],
      [
        3,
        3
      ],
      [
        4,
        4
      ],
      [
        2,
        5
      ],
      [
        3,
        2
      ]
    ],
    "start": [
      0,
      0
    ],
    "solution": [
      "D",
      "R",
      "U",
      "R",
      "D",
      "L",
      "U",
      "L",
      "D",
      "R",
      "D",
      "R"
    ],
    "moves": 12,
    "walkable": 31,
    "id": 37,
    "name": "Nivel 37",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        2,
        5
      ],
      [
        4,
        5
      ],
      [
        0,
        2
      ],
      [
        3,
        5
      ],
      [
        5,
        5
      ]
    ],
    "start": [
      4,
      3
    ],
    "solution": [
      "L",
      "D",
      "R",
      "U",
      "R",
      "U",
      "L",
      "D",
      "R",
      "D",
      "L"
    ],
    "moves": 11,
    "walkable": 31,
    "id": 38,
    "name": "Nivel 38",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 5,
    "walls": [
      [
        5,
        3
      ],
      [
        5,
        4
      ],
      [
        5,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "start": [
      2,
      1
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "D",
      "L",
      "U",
      "R",
      "D",
      "R",
      "U"
    ],
    "moves": 11,
    "walkable": 25,
    "id": 39,
    "name": "Nivel 39",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        4,
        3
      ],
      [
        2,
        2
      ],
      [
        3,
        5
      ],
      [
        1,
        5
      ],
      [
        2,
        5
      ]
    ],
    "start": [
      0,
      5
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "U",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L"
    ],
    "moves": 12,
    "walkable": 31,
    "id": 40,
    "name": "Nivel 40",
    "world": 4,
    "worldName": "El Templo Antiguo"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        3,
        0
      ],
      [
        1,
        4
      ],
      [
        2,
        4
      ],
      [
        1,
        1
      ]
    ],
    "start": [
      1,
      3
    ],
    "solution": [
      "L",
      "D",
      "R",
      "U",
      "L",
      "D",
      "L",
      "U",
      "L",
      "U",
      "L",
      "D",
      "R",
      "D"
    ],
    "moves": 14,
    "walkable": 32,
    "id": 41,
    "name": "Nivel 41",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        4,
        2
      ],
      [
        1,
        4
      ],
      [
        3,
        5
      ],
      [
        3,
        3
      ],
      [
        5,
        2
      ]
    ],
    "start": [
      4,
      5
    ],
    "solution": [
      "R",
      "U",
      "L",
      "D",
      "L",
      "D",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D",
      "R",
      "U",
      "R"
    ],
    "moves": 15,
    "walkable": 31,
    "id": 42,
    "name": "Nivel 42",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        4,
        3
      ],
      [
        0,
        5
      ],
      [
        1,
        2
      ],
      [
        1,
        1
      ],
      [
        1,
        3
      ]
    ],
    "start": [
      3,
      5
    ],
    "solution": [
      "L",
      "U",
      "L",
      "U",
      "R",
      "D",
      "L",
      "U",
      "L",
      "U",
      "R",
      "D",
      "L",
      "D"
    ],
    "moves": 14,
    "walkable": 31,
    "id": 43,
    "name": "Nivel 43",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        0,
        5
      ],
      [
        4,
        1
      ],
      [
        0,
        4
      ],
      [
        0,
        3
      ],
      [
        4,
        2
      ],
      [
        1,
        3
      ]
    ],
    "start": [
      3,
      2
    ],
    "solution": [
      "U",
      "R",
      "D",
      "L",
      "U",
      "R",
      "U",
      "L",
      "U",
      "L",
      "D",
      "R",
      "U"
    ],
    "moves": 13,
    "walkable": 30,
    "id": 44,
    "name": "Nivel 44",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        0,
        3
      ],
      [
        3,
        0
      ],
      [
        1,
        1
      ]
    ],
    "start": [
      3,
      5
    ],
    "solution": [
      "R",
      "U",
      "L",
      "D",
      "L",
      "U",
      "L",
      "U",
      "L",
      "D",
      "R",
      "D",
      "L",
      "D",
      "L",
      "U"
    ],
    "moves": 16,
    "walkable": 31,
    "id": 45,
    "name": "Nivel 45",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        2,
        2
      ],
      [
        4,
        5
      ],
      [
        3,
        3
      ],
      [
        1,
        4
      ],
      [
        5,
        3
      ],
      [
        4,
        1
      ]
    ],
    "start": [
      5,
      2
    ],
    "solution": [
      "U",
      "L",
      "D",
      "R",
      "U",
      "L",
      "U",
      "L",
      "U",
      "R",
      "D",
      "R",
      "D",
      "R",
      "D"
    ],
    "moves": 15,
    "walkable": 30,
    "id": 46,
    "name": "Nivel 46",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        1,
        2
      ],
      [
        4,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        4
      ],
      [
        3,
        2
      ],
      [
        5,
        3
      ]
    ],
    "start": [
      2,
      5
    ],
    "solution": [
      "R",
      "U",
      "L",
      "U",
      "R",
      "U",
      "R",
      "U",
      "L",
      "D",
      "R",
      "U",
      "R",
      "U",
      "R"
    ],
    "moves": 15,
    "walkable": 30,
    "id": 47,
    "name": "Nivel 47",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        2,
        1
      ],
      [
        1,
        4
      ],
      [
        0,
        2
      ],
      [
        3,
        5
      ]
    ],
    "start": [
      1,
      1
    ],
    "solution": [
      "L",
      "U",
      "R",
      "D",
      "L",
      "U",
      "L",
      "D",
      "L",
      "U",
      "L",
      "D",
      "L",
      "D",
      "R"
    ],
    "moves": 15,
    "walkable": 32,
    "id": 48,
    "name": "Nivel 48",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        4,
        3
      ],
      [
        5,
        3
      ],
      [
        2,
        0
      ],
      [
        1,
        2
      ],
      [
        4,
        1
      ],
      [
        3,
        3
      ]
    ],
    "start": [
      1,
      4
    ],
    "solution": [
      "R",
      "D",
      "L",
      "U",
      "R",
      "D",
      "R",
      "U",
      "R",
      "D",
      "L",
      "D",
      "L"
    ],
    "moves": 13,
    "walkable": 30,
    "id": 49,
    "name": "Nivel 49",
    "world": 5,
    "worldName": "El Espacio Estelar"
  },
  {
    "w": 6,
    "h": 6,
    "walls": [
      [
        0,
        0
      ],
      [
        0,
        5
      ],
      [
        1,
        3
      ],
      [
        2,
        1
      ]
    ],
    "start": [
      0,
      1
    ],
    "solution": [
      "R",
      "U",
      "R",
      "D",
      "L",
      "U",
      "R",
      "U",
      "L",
      "D",
      "L",
      "U",
      "L",
      "D"
    ],
    "moves": 14,
    "walkable": 32,
    "id": 50,
    "name": "Nivel 50",
    "world": 5,
    "worldName": "El Espacio Estelar"
  }
];

if (typeof window !== "undefined") { window.LEVELS = LEVELS; }
if (typeof module !== "undefined") { module.exports = { LEVELS }; }
