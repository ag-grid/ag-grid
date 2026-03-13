import { pseudoRandom } from './utils';

export type ExtraColDataType = 'number' | 'currency' | 'percent' | 'text' | 'rating';

export interface ExtraColConfig {
    headerName: string;
    group: string;
    dataType: ExtraColDataType;
    values?: string[];
}

const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
const roles = ['Attacker', 'Defender', 'Strategist', 'Support', 'Wildcard'];
const teamNames = [
    'Phoenix Rising',
    'Shadow Wolves',
    'Thunder Hawks',
    'Iron Bears',
    'Storm Riders',
    'Silver Foxes',
    'Dark Knights',
    'Golden Eagles',
    'Arctic Falcons',
    'Crimson Tide',
];
const strategies = ['Aggressive', 'Defensive', 'Balanced', 'Counter-Attack', 'Positional'];
const controllerTypes = ['Keyboard', 'Gamepad', 'Touchscreen', 'Joystick', 'Custom'];
const regions = ['North', 'South', 'East', 'West', 'Central'];
const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
const platforms = ['PC', 'Console', 'Mobile', 'Tablet', 'VR'];
const statuses = ['Active', 'Inactive', 'Suspended', 'Retired', 'Probation'];
const divisions = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'];

export const extraColumns: ExtraColConfig[] = [
    // Performance Metrics
    { headerName: 'Win Rate', group: 'Performance', dataType: 'percent' },
    { headerName: 'Avg Score', group: 'Performance', dataType: 'number' },
    { headerName: 'Best Score', group: 'Performance', dataType: 'number' },
    { headerName: 'Matches Played', group: 'Performance', dataType: 'number' },
    { headerName: 'Hours Played', group: 'Performance', dataType: 'number' },
    { headerName: 'XP Points', group: 'Performance', dataType: 'number' },
    { headerName: 'Level', group: 'Performance', dataType: 'number' },
    { headerName: 'Accuracy', group: 'Performance', dataType: 'percent' },
    { headerName: 'Win Streak', group: 'Performance', dataType: 'number' },
    { headerName: 'Rank Points', group: 'Performance', dataType: 'number' },

    // Tournament History
    { headerName: 'Tournaments Entered', group: 'Tournaments', dataType: 'number' },
    { headerName: 'Tournaments Won', group: 'Tournaments', dataType: 'number' },
    { headerName: 'Runner Up Finishes', group: 'Tournaments', dataType: 'number' },
    { headerName: 'Prize Money', group: 'Tournaments', dataType: 'currency' },
    { headerName: 'Best Finish', group: 'Tournaments', dataType: 'number' },
    { headerName: 'Entry Fees', group: 'Tournaments', dataType: 'currency' },
    { headerName: 'Forfeits', group: 'Tournaments', dataType: 'number' },
    { headerName: 'Disqualifications', group: 'Tournaments', dataType: 'number' },

    // Social
    { headerName: 'Friends', group: 'Social', dataType: 'number' },
    { headerName: 'Followers', group: 'Social', dataType: 'number' },
    { headerName: 'Posts', group: 'Social', dataType: 'number' },
    { headerName: 'Achievements', group: 'Social', dataType: 'number' },
    { headerName: 'Reputation', group: 'Social', dataType: 'number' },
    { headerName: 'Community Rating', group: 'Social', dataType: 'rating' },

    // Financial
    { headerName: 'Equipment Cost', group: 'Financial', dataType: 'currency' },
    { headerName: 'Travel Expenses', group: 'Financial', dataType: 'currency' },
    { headerName: 'Sponsorship', group: 'Financial', dataType: 'currency' },
    { headerName: 'Net Profit', group: 'Financial', dataType: 'currency' },
    { headerName: 'Tax Paid', group: 'Financial', dataType: 'currency' },
    { headerName: 'Insurance Cost', group: 'Financial', dataType: 'currency' },
    { headerName: 'Coaching Fees', group: 'Financial', dataType: 'currency' },
    { headerName: 'Subscription Cost', group: 'Financial', dataType: 'currency' },

    // Game Details
    { headerName: 'Difficulty', group: 'Game Details', dataType: 'text', values: difficulties },
    { headerName: 'Team Name', group: 'Game Details', dataType: 'text', values: teamNames },
    { headerName: 'Role', group: 'Game Details', dataType: 'text', values: roles },
    { headerName: 'Strategy', group: 'Game Details', dataType: 'text', values: strategies },
    { headerName: 'Controller Type', group: 'Game Details', dataType: 'text', values: controllerTypes },
    { headerName: 'Division', group: 'Game Details', dataType: 'text', values: divisions },
    { headerName: 'Platform', group: 'Game Details', dataType: 'text', values: platforms },
    { headerName: 'Status', group: 'Game Details', dataType: 'text', values: statuses },

    // Training
    { headerName: 'Training Hours', group: 'Training', dataType: 'number' },
    { headerName: 'Sessions Completed', group: 'Training', dataType: 'number' },
    { headerName: 'Drills Passed', group: 'Training', dataType: 'number' },
    { headerName: 'Coaching Score', group: 'Training', dataType: 'percent' },
    { headerName: 'Fitness Level', group: 'Training', dataType: 'rating' },
    { headerName: 'Reaction Time (ms)', group: 'Training', dataType: 'number' },
    { headerName: 'Training Cost', group: 'Training', dataType: 'currency' },
    { headerName: 'Improvement Rate', group: 'Training', dataType: 'percent' },

    // Seasonal Stats
    { headerName: 'Q1 Earnings', group: 'Seasonal', dataType: 'currency' },
    { headerName: 'Q2 Earnings', group: 'Seasonal', dataType: 'currency' },
    { headerName: 'Q3 Earnings', group: 'Seasonal', dataType: 'currency' },
    { headerName: 'Q4 Earnings', group: 'Seasonal', dataType: 'currency' },
    { headerName: 'Q1 Wins', group: 'Seasonal', dataType: 'number' },
    { headerName: 'Q2 Wins', group: 'Seasonal', dataType: 'number' },
    { headerName: 'Q3 Wins', group: 'Seasonal', dataType: 'number' },
    { headerName: 'Q4 Wins', group: 'Seasonal', dataType: 'number' },

    // Equipment
    { headerName: 'Setup Cost', group: 'Equipment', dataType: 'currency' },
    { headerName: 'Monitor Size', group: 'Equipment', dataType: 'number' },
    { headerName: 'Peripherals Cost', group: 'Equipment', dataType: 'currency' },
    { headerName: 'Upgrades', group: 'Equipment', dataType: 'number' },
    { headerName: 'Tier', group: 'Equipment', dataType: 'text', values: tiers },
    { headerName: 'Region', group: 'Equipment', dataType: 'text', values: regions },

    // Misc
    { headerName: 'Penalties', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Bonus Points', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Referrals', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Complaints', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Awards', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Loyalty Points', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Event Attendance', group: 'Miscellaneous', dataType: 'number' },
    { headerName: 'Feedback Score', group: 'Miscellaneous', dataType: 'percent' },
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
    'Harper',
    'Noel',
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
    'Thornton',
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

    //create data for the additional columns
    for (let col = defaultColCount; col < colCount; col++) {
        const extraColIndex = col - defaultColCount;
        const colConfig = extraColumns[extraColIndex % extraColumns.length];
        let value: string | number;
        switch (colConfig.dataType) {
            case 'currency':
                value = Math.round(pseudoRandom() * 50000) - 5000;
                break;
            case 'percent':
                value = Math.round(pseudoRandom() * 10000) / 100;
                break;
            case 'rating':
                value = Math.round(pseudoRandom() * 5);
                break;
            case 'text':
                value = colConfig.values![Math.floor(pseudoRandom() * colConfig.values!.length)];
                break;
            case 'number':
            default:
                value = Math.round(pseudoRandom() * 1000);
                break;
        }
        rowItem['col' + col] = value;
    }

    return rowItem;
};
