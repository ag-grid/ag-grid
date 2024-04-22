const sports = [
    '🏀 Basketball',
    '🏈 American Football',
    '⚽ Soccer Ball',
    '⚾ Baseball',
    '🥎 Softball',
    '🎾 Tennis',
    '🏐 Volleyball',
    '🏉 Rugby',
    '🎱 Billiards',
    '🏓 Ping Pong',
    '🏸 Badminton',
    '🏒 Ice Hockey',
    '🏑 Field Hockey',
    '🥍 Lacrosse',
    '🏏 Cricket',
    '🎿 Skiing',
    '🛷 Bobsleigh',
    '🛹 Skateboarding',
    '⛸️ Speed Skating',
    '🥌 Curling',
    '🎯 Darts',
    '🎳 Bowling',
    '🚴 Cycling ',
    '🏇 Horse Racing',
    '🏂 Snowboarding',
    '🏊 Swimming',
    '🚣 Rowing',
    '🏹 Archery',
];

const firstNames = [
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

const lastNames = [
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

const countryNames = [
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

const getRandomFromList = (list) => {
    return list[Math.floor(Math.random() * list.length)]
};

const getRandomCash = (min, max) => {
    return Math.floor((Math.random() * (max - min) + min) * 100);
};

const getRandomRow = () => {
    const winnings2023 = getRandomCash(10, 500);
    const winnings2022 = getRandomCash(10, 500);

    return {
        name: `${getRandomFromList(firstNames)} ${getRandomFromList(lastNames)}`,
        sport: getRandomFromList(sports),
        country: getRandomFromList(countryNames),
        winningsTotal: winnings2023 + winnings2022,
        winnings2023: winnings2023,
        winnings2022: winnings2022
    };
};

const numberOfRows = 500;

export const defaultRowData = () => {
    return Array.from({length: numberOfRows}, () => getRandomRow());
};
