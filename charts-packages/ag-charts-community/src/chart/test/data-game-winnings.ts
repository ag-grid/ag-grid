function groupedData(game: string, country: string): {} {
    return {
        labels: [game, country],
        toString: () => `${country} - ${game}`,
    };
}

export const DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY = [
    {
        grouping: groupedData('Blood Bowl', 'Argentina'),
        totalWinnings: 557754,
    },
    {
        grouping: groupedData('Cross and Circle', 'Argentina'),
        totalWinnings: 289890,
    },
    {
        grouping: groupedData('Isola', 'Belgium'),
        totalWinnings: 506858,
    },
    {
        grouping: groupedData('Game of the Generals', 'Brazil'),
        totalWinnings: 607503,
    },
    {
        grouping: groupedData('Abalone', 'Colombia'),
        totalWinnings: 508537,
    },
    {
        grouping: groupedData('Hare and Hounds', 'Colombia'),
        totalWinnings: 574681,
    },
    {
        grouping: groupedData('Agon', 'France'),
        totalWinnings: 507707,
    },
    {
        grouping: groupedData('Battleship', 'France'),
        totalWinnings: 564090,
    },
    {
        grouping: groupedData('Blood Bowl', 'France'),
        totalWinnings: 624867,
    },
    {
        grouping: groupedData('Bul', 'France'),
        totalWinnings: 675005,
    },
    {
        grouping: groupedData('Checkers', 'France'),
        totalWinnings: 494472,
    },
    {
        grouping: groupedData('Kalah', 'France'),
        totalWinnings: 605384,
    },
    // {
    //   grouping: groupedData("Kamisado", "France"),
    //   totalWinnings: 690270,
    // },
    // {
    //   grouping: groupedData("Liu po", "France"),
    //   totalWinnings: 710002,
    // },
    // {
    //   grouping: groupedData("Lost Cities", "France"),
    //   totalWinnings: 496453,
    // },
    // {
    //   grouping: groupedData("Master Mind", "France"),
    //   totalWinnings: 699330,
    // },
    // {
    //   grouping: groupedData("Nine Men's Morris", "France"),
    //   totalWinnings: 1044851,
    // },
    // {
    //   grouping: groupedData("Othello", "France"),
    //   totalWinnings: 705176,
    // },
    // {
    //   grouping: groupedData("PUNCT", "France"),
    //   totalWinnings: 493705,
    // },
    // {
    //   grouping: groupedData("Patolli", "France"),
    //   totalWinnings: 1394195,
    // },
    // {
    //   grouping: groupedData("Rithmomachy", "France"),
    //   totalWinnings: 608244,
    // },
    // {
    //   grouping: groupedData("Senet", "France"),
    //   totalWinnings: 328491,
    // },
    // {
    //   grouping: groupedData("Shogi", "France"),
    //   totalWinnings: 688012,
    // },
    // {
    //   grouping: groupedData("Stratego", "France"),
    //   totalWinnings: 552995,
    // },
    // {
    //   grouping: groupedData("Wari", "France"),
    //   totalWinnings: 1330023,
    // },
    // {
    //   grouping: groupedData("Rithmomachy", "Germany"),
    //   totalWinnings: 524495,
    // },
    // {
    //   grouping: groupedData("Space Hulk", "Germany"),
    //   totalWinnings: 507323,
    // },
    // {
    //   grouping: groupedData("Stratego", "Germany"),
    //   totalWinnings: 687995,
    // },
    // {
    //   grouping: groupedData("Downfall", "Greece"),
    //   totalWinnings: 544903,
    // },
    // {
    //   grouping: groupedData("Hare and Hounds", "Greece"),
    //   totalWinnings: 553974,
    // },
    // {
    //   grouping: groupedData("Kalah", "Greece"),
    //   totalWinnings: 542409,
    // },
    // {
    //   grouping: groupedData("Patolli", "Greece"),
    //   totalWinnings: 552459,
    // },
    // {
    //   grouping: groupedData("Backgammon", "Iceland"),
    //   totalWinnings: 692124,
    // },
    // {
    //   grouping: groupedData("Checkers", "Iceland"),
    //   totalWinnings: 683235,
    // },
    // {
    //   grouping: groupedData("Fanorona", "Iceland"),
    //   totalWinnings: 521588,
    // },
    // {
    //   grouping: groupedData("Obsession", "Iceland"),
    //   totalWinnings: 590992,
    // },
    // {
    //   grouping: groupedData("Chess", "Ireland"),
    //   totalWinnings: 569571,
    // },
    // {
    //   grouping: groupedData("Cross and Circle", "Ireland"),
    //   totalWinnings: 643371,
    // },
    // {
    //   grouping: groupedData("DVONN", "Ireland"),
    //   totalWinnings: 569924,
    // },
    // {
    //   grouping: groupedData("Downfall", "Ireland"),
    //   totalWinnings: 771415,
    // },
    // {
    //   grouping: groupedData("Game of the Generals", "Ireland"),
    //   totalWinnings: 467414,
    // },
    // {
    //   grouping: groupedData("Ghosts", "Ireland"),
    //   totalWinnings: 520451,
    // },
    // {
    //   grouping: groupedData("Gipf", "Ireland"),
    //   totalWinnings: 1262384,
    // },
    // {
    //   grouping: groupedData("Guess Who?", "Ireland"),
    //   totalWinnings: 588168,
    // },
    // {
    //   grouping: groupedData("Hex", "Ireland"),
    //   totalWinnings: 627330,
    // },
    // {
    //   grouping: groupedData("Hijara", "Ireland"),
    //   totalWinnings: 1198106,
    // },
    // {
    //   grouping: groupedData("Janggi (Korean Chess)", "Ireland"),
    //   totalWinnings: 376142,
    // },
    // {
    //   grouping: groupedData("Plateau", "Ireland"),
    //   totalWinnings: 588944,
    // },
    // {
    //   grouping: groupedData("Sahkku", "Ireland"),
    //   totalWinnings: 505705,
    // },
    // {
    //   grouping: groupedData("Shogi", "Ireland"),
    //   totalWinnings: 616276,
    // },
    // {
    //   grouping: groupedData("Sugoroku", "Ireland"),
    //   totalWinnings: 651234,
    // },
    // {
    //   grouping: groupedData("Tab", "Ireland"),
    //   totalWinnings: 647992,
    // },
    // {
    //   grouping: groupedData("Tantrix", "Ireland"),
    //   totalWinnings: 509042,
    // },
    // {
    //   grouping: groupedData("Wari", "Ireland"),
    //   totalWinnings: 715033,
    // },
    // {
    //   grouping: groupedData("YINSH", "Ireland"),
    //   totalWinnings: 490232,
    // },
    // {
    //   grouping: groupedData("ZERTZ", "Ireland"),
    //   totalWinnings: 532848,
    // },
    // {
    //   grouping: groupedData("Master Mind", "Italy"),
    //   totalWinnings: 495293,
    // },
    // {
    //   grouping: groupedData("Sahkku", "Italy"),
    //   totalWinnings: 507284,
    // },
    // {
    //   grouping: groupedData("Sugoroku", "Italy"),
    //   totalWinnings: 456890,
    // },
    // {
    //   grouping: groupedData("Tab", "Italy"),
    //   totalWinnings: 605803,
    // },
    // {
    //   grouping: groupedData("YINSH", "Italy"),
    //   totalWinnings: 563168,
    // },
    // {
    //   grouping: groupedData("Blood Bowl", "Luxembourg"),
    //   totalWinnings: 752870,
    // },
    // {
    //   grouping: groupedData("Guess Who?", "Luxembourg"),
    //   totalWinnings: 718528,
    // },
    // {
    //   grouping: groupedData("Janggi (Korean Chess)", "Luxembourg"),
    //   totalWinnings: 807069,
    // },
    // {
    //   grouping: groupedData("PUNCT", "Luxembourg"),
    //   totalWinnings: 593754,
    // },
    // {
    //   grouping: groupedData(
    //     "Xiangqi (Chinese chess)",
    //     "Luxembourg"
    //   ),
    //   totalWinnings: 797881,
    // },
    // {
    //   grouping: groupedData("Blockade", "Malta"),
    //   totalWinnings: 622755,
    // },
    // {
    //   grouping: groupedData("Chess", "Malta"),
    //   totalWinnings: 639553,
    // },
    // {
    //   grouping: groupedData("Tablut", "Malta"),
    //   totalWinnings: 354876,
    // },
    // {
    //   grouping: groupedData("ZERTZ", "Malta"),
    //   totalWinnings: 675154,
    // },
    // {
    //   grouping: groupedData("Liu po", "Norway"),
    //   totalWinnings: 910598,
    // },
    // {
    //   grouping: groupedData("Othello", "Norway"),
    //   totalWinnings: 474582,
    // },
    // {
    //   grouping: groupedData("ZERTZ", "Norway"),
    //   totalWinnings: 725657,
    // },
    // {
    //   grouping: groupedData("Camelot", "Peru"),
    //   totalWinnings: 697097,
    // },
    // {
    //   grouping: groupedData("Chess", "Portugal"),
    //   totalWinnings: 552024,
    // },
    // {
    //   grouping: groupedData("Fanorona", "Portugal"),
    //   totalWinnings: 653978,
    // },
    // {
    //   grouping: groupedData("Game of the Generals", "Portugal"),
    //   totalWinnings: 600036,
    // },
    // {
    //   grouping: groupedData("Liu po", "Portugal"),
    //   totalWinnings: 763919,
    // },
    // {
    //   grouping: groupedData("Mad Gab", "Portugal"),
    //   totalWinnings: 432133,
    // },
    // {
    //   grouping: groupedData("Blockade", "Spain"),
    //   totalWinnings: 517351,
    // },
    // {
    //   grouping: groupedData("Go", "Spain"),
    //   totalWinnings: 449766,
    // },
    // {
    //   grouping: groupedData("Le Jeu de la Guerre", "Spain"),
    //   totalWinnings: 651806,
    // },
    // {
    //   grouping: groupedData("Agon", "Sweden"),
    //   totalWinnings: 518440,
    // },
    // {
    //   grouping: groupedData("Bul", "Sweden"),
    //   totalWinnings: 481734,
    // },
    // {
    //   grouping: groupedData("Downfall", "Sweden"),
    //   totalWinnings: 580882,
    // },
    // {
    //   grouping: groupedData("Mad Gab", "Sweden"),
    //   totalWinnings: 793660,
    // },
    // {
    //   grouping: groupedData("Sugoroku", "Sweden"),
    //   totalWinnings: 658198,
    // },
    // {
    //   grouping: groupedData("Daldos", "United Kingdom"),
    //   totalWinnings: 469726,
    // },
    // {
    //   grouping: groupedData("Ghosts", "United Kingdom"),
    //   totalWinnings: 662616,
    // },
    // {
    //   grouping: groupedData("Guess Who?", "United Kingdom"),
    //   totalWinnings: 693658,
    // },
    // {
    //   grouping: groupedData("Shogi", "United Kingdom"),
    //   totalWinnings: 732026,
    // },
    // {
    //   grouping: groupedData("Checkers", "Uruguay"),
    //   totalWinnings: 471444,
    // },
    // {
    //   grouping: groupedData("Rithmomachy", "Uruguay"),
    //   totalWinnings: 747956,
    // },
    // {
    //   grouping: groupedData("Agon", "Venezuela"),
    //   totalWinnings: 561290,
    // },
    // {
    //   grouping: groupedData("Hijara", "Venezuela"),
    //   totalWinnings: 677324,
    // },
];
