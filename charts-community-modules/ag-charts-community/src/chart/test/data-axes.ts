import { seedRandom } from './random';
import { dateRange, range } from './utils';

const countries = [
    'Ireland',
    'Spain',
    'United Kingdom',
    'France',
    'Germany',
    'Luxembourg',
    'Sweden',
    'Norway',
    'Italy',
    'Greece',
    'Iceland',
    'Portugal',
    'Malta',
    'Brazil',
    'Argentina',
    'Colombia',
    'Peru',
    'Venezuela',
    'Uruguay',
    'Belgium',
];

// Ensure we generate consistent 'random' numbers.
const dietaryRandom = seedRandom(75023847123);

export const DATA_COUNTRY_DIETARY_STATS = countries.map((country) => {
    return {
        country: country,
        sugar: Math.floor(dietaryRandom() * 50),
        fat: Math.floor(dietaryRandom() * 100),
        weight: Math.floor(dietaryRandom() * 200),
    };
});

// Ensure we generate consistent 'random' numbers.
const youtubeRandom = seedRandom(49275017231);

export const DATA_YOUTUBE_VIDEOS_STATS_BY_DAY_OF_YEAR = range(100, 300, 5).map((day) => {
    return {
        day,
        likes: Math.floor(youtubeRandom() * 500),
        subscribes: Math.floor(youtubeRandom() * 50),
        comments: Math.floor(youtubeRandom() * 25),
    };
});

// Ensure we generate consistent 'random' numbers.
const youtubeRandom2 = seedRandom(49275017231);
export const DATA_YOUTUBE_VIDEOS_STATS_BY_DAY_OF_YEAR_LARGE_SCALE = range(100, 300, 5).map((day) => {
    return {
        day,
        likes: Math.floor(youtubeRandom2() * 500_000),
        subscribes: Math.floor(youtubeRandom2() * 50_000),
        comments: Math.floor(youtubeRandom2() * 25_000),
    };
});

// Ensure we generate consistent 'random' numbers.
const youtubeRandom3 = seedRandom(49275017231);

export const DATA_YOUTUBE_VIDEOS_STATS_BY_DATE = dateRange(
    new Date(2022, 0, 1, 0, 0, 0),
    new Date(2022, 2, 31, 0, 0, 0)
).map((date) => {
    return {
        date,
        likes: Math.floor(youtubeRandom3() * 500),
        subscribes: Math.floor(youtubeRandom3() * 50),
        comments: Math.floor(youtubeRandom3() * 25),
    };
});
