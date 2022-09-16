import { seedRandom } from './random';

export const DATA_MEAN_SEA_LEVEL = (() => {
    const seaLevelRandom = seedRandom(75023847123);
    const meanSeaLevelData = [];

    for (let i = 0; i < 1000; i++) {
        meanSeaLevelData.push({
            time: seaLevelRandom() * 15 + 1998, // time between 1998 and 2013
            mm: seaLevelRandom() * 100 - 20, // mean sea level between -20 and 80
        });
    }

    return meanSeaLevelData;
})();

export const DATA_REVENUE = (() => {
    const appleRevenueRandom = seedRandom(10763960837);
    const revenueData = [];
    // Two year's worth of monthly data
    for (let idx = 1000; idx > 0; idx--) {
        const today = new Date();
        if (idx % 30 === 0) {
            today.setDate(today.getDate() - idx);
            revenueData.push({
                date: today,
                value: appleRevenueRandom() * 1000,
            });
        }
    }
    return revenueData;
})();

export const DATA_APPLE_REVENUE_BY_PRODUCT = [
    {
        quarter: "Q1'18",
        iphone: 140,
        mac: 16,
        ipad: 14,
        wearables: 12,
        services: 20,
    },
    {
        quarter: "Q2'18",
        iphone: 134,
        mac: 20,
        ipad: 14,
        wearables: 12,
        services: 30,
    },
    {
        quarter: "Q3'18",
        iphone: 124,
        mac: 20,
        ipad: 18,
        wearables: 14,
        services: 36,
    },
    {
        quarter: "Q4'18",
        iphone: 118,
        mac: 24,
        ipad: 14,
        wearables: 14,
        services: 36,
    },
    {
        quarter: "Q1'19",
        iphone: 112,
        mac: 18,
        ipad: 16,
        wearables: 18,
        services: 26,
    },
    {
        quarter: "Q2'19",
        iphone: 108,
        mac: 20,
        ipad: 16,
        wearables: 18,
        services: 40,
    },
    {
        quarter: "Q3'19",
        iphone: 96,
        mac: 22,
        ipad: 18,
        wearables: 24,
        services: 42,
    },
    {
        quarter: "Q4'19",
        iphone: 104,
        mac: 22,
        ipad: 14,
        wearables: 20,
        services: 40,
    },
];

export const DATA_VISITORS = [
    {
        year: new Date('01 Jan 2000 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2001 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2002 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2003 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2004 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2005 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2006 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2008 00:00:00 GMT'),
        visitors: 191000,
    },
    {
        year: new Date('01 Jan 2009 00:00:00 GMT'),
        visitors: 45000,
    },
    {
        year: new Date('01 Jan 2010 00:00:00 GMT'),
        visitors: 100000,
    },
    {
        year: new Date('01 Jan 2011 00:00:00 GMT'),
        visitors: null,
    },
    {
        year: new Date('01 Jan 2012 00:00:00 GMT'),
        visitors: 78000,
    },
    {
        year: new Date('01 Jan 2013 00:00:00 GMT'),
        visitors: 136000,
    },
    {
        year: new Date('01 Jan 2014 00:00:00 GMT'),
        visitors: undefined,
    },
    {
        year: new Date('01 Jan 2015 00:00:00 GMT'),
        visitors: NaN,
    },
    {
        year: new Date('01 Jan 2016 00:00:00 GMT'),
        visitors: 67000,
    },
    {
        year: new Date('01 Jan 2017 00:00:00 GMT'),
        visitors: Infinity,
    },
    {
        year: new Date('01 Jan 2018 00:00:00 GMT'),
        visitors: 174000,
    },
    {
        year: new Date('01 Jan 2019 00:00:00 GMT'),
        visitors: 76000,
    },
    {
        year: new Date('01 Jan 2020 00:00:00 GMT'),
        visitors: 56000,
    },
];

export const DATA_TIME_SENSOR = [
    {
        time: new Date('01 Jan 2020 13:25:30 GMT'),
        sensor: 25,
    },
    {
        time: new Date('02 Jan 2020 13:26:30 GMT'),
        sensor: 24,
    },
];

export const DATA_SINGLE_DATUM_TIME_SENSOR = [
    {
        time: new Date('01 Jan 2020 13:25:30 GMT'),
        sensor: 21,
    },
];

export const DATA_INTERNET_EXPLORER_MARKET_SHARE_BAD_Y_VALUE = [
    {
        year: '2009',
        ie: -64.97,
    },
    {
        year: '2010',
        ie: 54.39,
    },
    {
        year: '2011',
        ie: 'a',
    },
    {
        year: '2012',
        ie: -34.27,
    },
    {
        year: '2013',
        ie: -26.55,
    },
];

export const DATA_MISSING_X = [
    { x: 0, y1: -37.3, y2: 12 },
    { x: undefined, y1: -7.3, y2: 40 },
    { x: 2, y1: 37.3, y2: 10 },
    { x: 3, y1: 7.3, y2: 5 },
];

export const DATA_TIME_MISSING_X = [
    { x: new Date(1976, 6, 4, 12, 30, 0, 0), y1: -37.3, y2: 12 },
    { x: null, y: -7.3, y2: 40 },
    { x: new Date(1978, 6, 4, 12, 30, 0, 0), y1: 37.3, y2: 10 },
    { x: new Date(1979, 6, 4, 12, 30, 0, 0), y1: 7.3, y2: 5 },
];

export const DATA_BROWSER_MARKET_SHARE = [
    {
        year: '2009',
        ie: 64.97,
        firefox: 26.85,
        safari: 2.79,
        chrome: 1.37,
    },
    {
        year: '2010',
        ie: 54.39,
        firefox: 31.15,
        safari: 4.22,
        chrome: undefined,
    },
    {
        year: '2011',
        ie: 44.03,
        firefox: undefined,
        safari: 5.94,
        chrome: 15.01,
    },
    {
        year: '2012',
        ie: 34.27,
        firefox: 22.69,
        safari: 8.09,
        chrome: 25.99,
    },
    {
        year: '2013',
        ie: 26.55,
        firefox: undefined,
        safari: undefined,
        chrome: 31.71,
    },
    {
        year: '2014',
        ie: 17.75,
        firefox: 14.77,
        safari: 12.63,
        chrome: 35.85,
    },
    {
        year: '2015',
        ie: -13.3,
        firefox: 11.82,
        safari: 13.79,
        chrome: 42.27,
    },
    {
        year: '2016',
        ie: -8.94,
        firefox: 8.97,
        safari: 12.9,
        chrome: 47.79,
    },
    {
        year: '2017',
        ie: -4.77,
        firefox: 6.75,
        safari: 14.54,
        chrome: 51.76,
    },
    {
        year: '2018',
        ie: 3.2,
        firefox: 5.66,
        safari: 14.44,
        chrome: 56.31,
    },
    {
        year: '2019',
        ie: 2.7,
        firefox: 4.66,
        safari: 15.23,
        chrome: 61.72,
    },
];

export const DATA_BROWSER_MARKET_SHARE_MISSING_FIRST_Y = [
    {
        year: '2009',
        ie: 64.97,
        firefox: 26.85,
        // safari: 2.79, Deliberately missing.
        chrome: 1.37,
    },
    {
        year: '2010',
        ie: 54.39,
        firefox: 31.15,
        safari: 4.22,
        chrome: 5.94,
    },
    {
        year: '2011',
        ie: 44.03,
        firefox: 29.36,
        safari: 5.94,
        chrome: 15.01,
    },
    {
        year: '2012',
        ie: 34.27,
        firefox: 22.69,
        safari: 8.09,
        chrome: 25.99,
    },
    {
        year: '2013',
        ie: 26.55,
        firefox: 18.55,
        safari: 10.66,
        chrome: 31.71,
    },
    {
        year: '2014',
        ie: 17.75,
        firefox: 14.77,
        safari: 12.63,
        chrome: 35.85,
    },
    {
        year: '2015',
        ie: 13.3,
        firefox: 11.82,
        safari: 13.79,
        chrome: 42.27,
    },
    {
        year: '2016',
        ie: 8.94,
        firefox: 8.97,
        safari: 12.9,
        chrome: 47.79,
    },
    {
        year: '2017',
        ie: 4.77,
        firefox: 6.75,
        safari: 14.54,
        chrome: 51.76,
    },
    {
        year: '2018',
        ie: 3.2,
        firefox: 5.66,
        safari: 14.44,
        chrome: 56.31,
    },
    {
        year: '2019',
        ie: 2.7,
        firefox: 4.66,
        safari: 15.23,
        chrome: 61.72,
    },
];

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
];

export const DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY_EXTENDED = DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY.concat([
    {
        grouping: groupedData('Kamisado', 'France'),
        totalWinnings: 690270,
    },
    {
        grouping: groupedData('Liu po', 'France'),
        totalWinnings: 710002,
    },
    {
        grouping: groupedData('Lost Cities', 'France'),
        totalWinnings: 496453,
    },
    {
        grouping: groupedData('Master Mind', 'France'),
        totalWinnings: 699330,
    },
    {
        grouping: groupedData("Nine Men's Morris", 'France'),
        totalWinnings: 1044851,
    },
    {
        grouping: groupedData('Othello', 'France'),
        totalWinnings: 705176,
    },
    {
        grouping: groupedData('PUNCT', 'France'),
        totalWinnings: 493705,
    },
    {
        grouping: groupedData('Patolli', 'France'),
        totalWinnings: 1394195,
    },
    {
        grouping: groupedData('Rithmomachy', 'France'),
        totalWinnings: 608244,
    },
    {
        grouping: groupedData('Senet', 'France'),
        totalWinnings: 328491,
    },
    {
        grouping: groupedData('Shogi', 'France'),
        totalWinnings: 688012,
    },
    {
        grouping: groupedData('Stratego', 'France'),
        totalWinnings: 552995,
    },
    {
        grouping: groupedData('Wari', 'France'),
        totalWinnings: 1330023,
    },
    {
        grouping: groupedData('Rithmomachy', 'Germany'),
        totalWinnings: 524495,
    },
    {
        grouping: groupedData('Space Hulk', 'Germany'),
        totalWinnings: 507323,
    },
    {
        grouping: groupedData('Stratego', 'Germany'),
        totalWinnings: 687995,
    },
    {
        grouping: groupedData('Downfall', 'Greece'),
        totalWinnings: 544903,
    },
    {
        grouping: groupedData('Hare and Hounds', 'Greece'),
        totalWinnings: 553974,
    },
    {
        grouping: groupedData('Kalah', 'Greece'),
        totalWinnings: 542409,
    },
    {
        grouping: groupedData('Patolli', 'Greece'),
        totalWinnings: 552459,
    },
    {
        grouping: groupedData('Backgammon', 'Iceland'),
        totalWinnings: 692124,
    },
    {
        grouping: groupedData('Checkers', 'Iceland'),
        totalWinnings: 683235,
    },
    {
        grouping: groupedData('Fanorona', 'Iceland'),
        totalWinnings: 521588,
    },
    {
        grouping: groupedData('Obsession', 'Iceland'),
        totalWinnings: 590992,
    },
    {
        grouping: groupedData('Chess', 'Ireland'),
        totalWinnings: 569571,
    },
    {
        grouping: groupedData('Cross and Circle', 'Ireland'),
        totalWinnings: 643371,
    },
    {
        grouping: groupedData('DVONN', 'Ireland'),
        totalWinnings: 569924,
    },
    {
        grouping: groupedData('Downfall', 'Ireland'),
        totalWinnings: 771415,
    },
    {
        grouping: groupedData('Game of the Generals', 'Ireland'),
        totalWinnings: 467414,
    },
    {
        grouping: groupedData('Ghosts', 'Ireland'),
        totalWinnings: 520451,
    },
    {
        grouping: groupedData('Gipf', 'Ireland'),
        totalWinnings: 1262384,
    },
    {
        grouping: groupedData('Guess Who?', 'Ireland'),
        totalWinnings: 588168,
    },
    {
        grouping: groupedData('Hex', 'Ireland'),
        totalWinnings: 627330,
    },
    {
        grouping: groupedData('Hijara', 'Ireland'),
        totalWinnings: 1198106,
    },
    {
        grouping: groupedData('Janggi (Korean Chess)', 'Ireland'),
        totalWinnings: 376142,
    },
    {
        grouping: groupedData('Plateau', 'Ireland'),
        totalWinnings: 588944,
    },
    {
        grouping: groupedData('Sahkku', 'Ireland'),
        totalWinnings: 505705,
    },
    {
        grouping: groupedData('Shogi', 'Ireland'),
        totalWinnings: 616276,
    },
    {
        grouping: groupedData('Sugoroku', 'Ireland'),
        totalWinnings: 651234,
    },
    {
        grouping: groupedData('Tab', 'Ireland'),
        totalWinnings: 647992,
    },
    {
        grouping: groupedData('Tantrix', 'Ireland'),
        totalWinnings: 509042,
    },
    {
        grouping: groupedData('Wari', 'Ireland'),
        totalWinnings: 715033,
    },
    {
        grouping: groupedData('YINSH', 'Ireland'),
        totalWinnings: 490232,
    },
    {
        grouping: groupedData('ZERTZ', 'Ireland'),
        totalWinnings: 532848,
    },
    {
        grouping: groupedData('Master Mind', 'Italy'),
        totalWinnings: 495293,
    },
    {
        grouping: groupedData('Sahkku', 'Italy'),
        totalWinnings: 507284,
    },
    {
        grouping: groupedData('Sugoroku', 'Italy'),
        totalWinnings: 456890,
    },
    {
        grouping: groupedData('Tab', 'Italy'),
        totalWinnings: 605803,
    },
    {
        grouping: groupedData('YINSH', 'Italy'),
        totalWinnings: 563168,
    },
    {
        grouping: groupedData('Blood Bowl', 'Luxembourg'),
        totalWinnings: 752870,
    },
    {
        grouping: groupedData('Guess Who?', 'Luxembourg'),
        totalWinnings: 718528,
    },
    {
        grouping: groupedData('Janggi (Korean Chess)', 'Luxembourg'),
        totalWinnings: 807069,
    },
    {
        grouping: groupedData('PUNCT', 'Luxembourg'),
        totalWinnings: 593754,
    },
    {
        grouping: groupedData('Xiangqi (Chinese chess)', 'Luxembourg'),
        totalWinnings: 797881,
    },
    {
        grouping: groupedData('Blockade', 'Malta'),
        totalWinnings: 622755,
    },
    {
        grouping: groupedData('Chess', 'Malta'),
        totalWinnings: 639553,
    },
    {
        grouping: groupedData('Tablut', 'Malta'),
        totalWinnings: 354876,
    },
    {
        grouping: groupedData('ZERTZ', 'Malta'),
        totalWinnings: 675154,
    },
    {
        grouping: groupedData('Liu po', 'Norway'),
        totalWinnings: 910598,
    },
    {
        grouping: groupedData('Othello', 'Norway'),
        totalWinnings: 474582,
    },
    {
        grouping: groupedData('ZERTZ', 'Norway'),
        totalWinnings: 725657,
    },
    {
        grouping: groupedData('Camelot', 'Peru'),
        totalWinnings: 697097,
    },
    {
        grouping: groupedData('Chess', 'Portugal'),
        totalWinnings: 552024,
    },
    {
        grouping: groupedData('Fanorona', 'Portugal'),
        totalWinnings: 653978,
    },
    {
        grouping: groupedData('Game of the Generals', 'Portugal'),
        totalWinnings: 600036,
    },
    {
        grouping: groupedData('Liu po', 'Portugal'),
        totalWinnings: 763919,
    },
    {
        grouping: groupedData('Mad Gab', 'Portugal'),
        totalWinnings: 432133,
    },
    {
        grouping: groupedData('Blockade', 'Spain'),
        totalWinnings: 517351,
    },
    {
        grouping: groupedData('Go', 'Spain'),
        totalWinnings: 449766,
    },
    {
        grouping: groupedData('Le Jeu de la Guerre', 'Spain'),
        totalWinnings: 651806,
    },
    {
        grouping: groupedData('Agon', 'Sweden'),
        totalWinnings: 518440,
    },
    {
        grouping: groupedData('Bul', 'Sweden'),
        totalWinnings: 481734,
    },
    {
        grouping: groupedData('Downfall', 'Sweden'),
        totalWinnings: 580882,
    },
    {
        grouping: groupedData('Mad Gab', 'Sweden'),
        totalWinnings: 793660,
    },
    {
        grouping: groupedData('Sugoroku', 'Sweden'),
        totalWinnings: 658198,
    },
    {
        grouping: groupedData('Daldos', 'United Kingdom'),
        totalWinnings: 469726,
    },
    {
        grouping: groupedData('Ghosts', 'United Kingdom'),
        totalWinnings: 662616,
    },
    {
        grouping: groupedData('Guess Who?', 'United Kingdom'),
        totalWinnings: 693658,
    },
    {
        grouping: groupedData('Shogi', 'United Kingdom'),
        totalWinnings: 732026,
    },
    {
        grouping: groupedData('Checkers', 'Uruguay'),
        totalWinnings: 471444,
    },
    {
        grouping: groupedData('Rithmomachy', 'Uruguay'),
        totalWinnings: 747956,
    },
    {
        grouping: groupedData('Agon', 'Venezuela'),
        totalWinnings: 561290,
    },
    {
        grouping: groupedData('Hijara', 'Venezuela'),
        totalWinnings: 677324,
    },
]);
