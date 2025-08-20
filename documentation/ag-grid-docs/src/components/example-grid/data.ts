import { pseudoRandom } from './utils';

export const colNames = [
    'Station',
    'Railway',
    'Street',
    'Address',
    'Toy',
    'Soft Box',
    'Make and Model',
    'Longest Day',
    'Shortest Night',
];

export const countries = [
    { country: 'Ireland', continent: 'Europe', language: 'English' },
    { country: 'Spain', continent: 'Europe', language: 'Spanish' },
    { country: 'United Kingdom', continent: 'Europe', language: 'English' },
    { country: 'France', continent: 'Europe', language: 'French' },
    { country: 'Germany', continent: 'Europe', language: 'German' },
    { country: 'Luxembourg', continent: 'Europe', language: 'French' },
    { country: 'Sweden', continent: 'Europe', language: 'Swedish' },
    { country: 'Norway', continent: 'Europe', language: 'Norwegian' },
    { country: 'Italy', continent: 'Europe', language: 'Italian' },
    { country: 'Greece', continent: 'Europe', language: 'Greek' },
    { country: 'Iceland', continent: 'Europe', language: 'Icelandic' },
    { country: 'Portugal', continent: 'Europe', language: 'Portuguese' },
    { country: 'Malta', continent: 'Europe', language: 'Maltese' },
    { country: 'Brazil', continent: 'South America', language: 'Portuguese' },
    { country: 'Argentina', continent: 'South America', language: 'Spanish' },
    { country: 'Colombia', continent: 'South America', language: 'Spanish' },
    { country: 'Peru', continent: 'South America', language: 'Spanish' },
    { country: 'Venezuela', continent: 'South America', language: 'Spanish' },
    { country: 'Uruguay', continent: 'South America', language: 'Spanish' },
    { country: 'Belgium', continent: 'Europe', language: 'French' },
];

export const COUNTRY_CODES: Record<string, string> = {
    Ireland: 'ie',
    Luxembourg: 'lu',
    Belgium: 'be',
    Spain: 'es',
    'United Kingdom': 'gb',
    France: 'fr',
    Germany: 'de',
    Sweden: 'se',
    Italy: 'it',
    Greece: 'gr',
    Iceland: 'is',
    Portugal: 'pt',
    Malta: 'mt',
    Norway: 'no',
    Brazil: 'br',
    Argentina: 'ar',
    Colombia: 'co',
    Peru: 'pe',
    Venezuela: 've',
    Uruguay: 'uy',
};

export const games = [
    'Chess',
    'Cross and Circle',
    'Daldos',
    'Downfall',
    'DVONN',
    'Fanorona',
    'Game of the Generals',
    'Ghosts',
    'Abalone',
    'Agon',
    'Backgammon',
    'Battleship',
    'Blockade',
    'Blood Bowl',
    'Bul',
    'Camelot',
    'Checkers',
    'Go',
    'Gipf',
    'Guess Who?',
    'Hare and Hounds',
    'Hex',
    'Hijara',
    'Isola',
    'Janggi (Korean Chess)',
    'Le Jeu de la Guerre',
    'Patolli',
    'Plateau',
    'PUNCT',
    'Rithmomachy',
    'Sahkku',
    'Senet',
    'Shogi',
    'Space Hulk',
    'Stratego',
    'Sugoroku',
    'Tab',
    'Tablut',
    'Tantrix',
    'Wari',
    'Xiangqi (Chinese chess)',
    'YINSH',
    'ZERTZ',
    'Kalah',
    'Kamisado',
    'Liu po',
    'Lost Cities',
    'Mad Gab',
    'Master Mind',
    "Nine Men's Morris",
    'Obsession',
    'Othello',
];

export const booleanValues = [true, true, false, false];

export const firstNames = [
    'Tony',
    'Andrew',
    'Kevin',
    'Bricker',
    'Dimple',
    'Gil',
    'Sophie',
    'Isabelle',
    'Emily',
    'Olivia',
    'Lily',
    'Chloe',
    'Isabella',
    'Amelia',
    'Jessica',
    'Sophia',
    'Ava',
    'Charlotte',
    'Mia',
    'Lucy',
    'Grace',
    'Ruby',
    'Ella',
    'Evie',
    'Freya',
    'Isla',
    'Poppy',
    'Daisy',
    'Layla',
];

export const lastNames = [
    'Smith',
    'Connell',
    'Flanagan',
    'McGee',
    'Unalkat',
    'Lopes',
    'Beckham',
    'Black',
    'Braxton',
    'Brennan',
    'Brock',
    'Bryson',
    'Cadwell',
    'Cage',
    'Carson',
    'Chandler',
    'Cohen',
    'Cole',
    'Corbin',
    'Dallas',
    'Dalton',
    'Dane',
    'Donovan',
    'Easton',
    'Fisher',
    'Fletcher',
    'Grady',
    'Greyson',
    'Griffin',
    'Gunner',
    'Hayden',
    'Hudson',
    'Hunter',
    'Jacoby',
    'Jagger',
    'Jaxon',
    'Jett',
    'Kade',
    'Kane',
    'Keating',
    'Keegan',
    'Kingston',
    'Kobe',
];

export const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'Portuguese',
    'German',
    'Swedish',
    'Norwegian',
    'Italian',
    'Greek',
    'Icelandic',
    'Portuguese',
    'Maltese',
];

export const COUNTRY_NAMES = [
    'Argentina',
    'Brazil',
    'Colombia',
    'France',
    'Germany',
    'Greece',
    'Iceland',
    'Ireland',
    'Italy',
    'Malta',
    'Portugal',
    'Norway',
    'Peru',
    'Spain',
    'Sweden',
    'United Kingdom',
    'Uruguay',
    'Venezuela',
    'Belgium',
    'Luxembourg',
];

export interface RowItem {
    country: string;
    language: string;
    name: string;
    game: {
        name: string;
        bought: boolean;
    };
    bankBalance: number;
    rating: number;
    totalWinnings: number;
    [month: string]: number | string | boolean | object | undefined;
    [key: `col${number}`]: string;
}

export const createRowItem = (row: number, colCount: number, defaultCols: number, defaultColCount: number): RowItem => {
    const rowItem: RowItem = {} as RowItem;

    //create data for the known columns
    const countriesToPickFrom = Math.floor(countries.length * (((row % 3) + 1) / 3));
    const countryData = countries[(row * 19) % countriesToPickFrom];
    rowItem.country = countryData.country;
    rowItem.language = countryData.language;

    const firstName = firstNames[row % firstNames.length];
    const lastName = lastNames[row % lastNames.length];
    rowItem.name = firstName + ' ' + lastName;

    rowItem.game = {
        name: games[Math.floor(((row * 13) / 17) * 19) % games.length],
        bought: booleanValues[row % booleanValues.length],
    };

    rowItem.bankBalance = Math.round(pseudoRandom() * 100000) - 3000;
    rowItem.rating = Math.round(pseudoRandom() * 5);

    let totalWinnings = 0;
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const value = Math.round(pseudoRandom() * 100000) - 20;
        rowItem[month] = value;
        totalWinnings += value;
    }
    rowItem.totalWinnings = totalWinnings;

    if (defaultCols) {
        for (let i = defaultCols; i < defaultColCount; i++) {
            // there was a bug in the old row generation logic which has since been fixed.
            // However, a side effect of this is that the number of calls to `pseudoRandom` changed,
            // so we need to call it that many times here to keep the numbers the same.
            pseudoRandom();
        }
    }

    //create dummy data for the additional columns
    for (let col = defaultColCount; col < colCount; col++) {
        const randomBit = pseudoRandom().toString().substring(2, 5);
        const value = colNames[col % colNames.length] + '-' + randomBit + ' - (' + (row + 1) + ',' + col + ')';
        rowItem['col' + col] = value;
    }

    return rowItem;
};
