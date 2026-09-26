/**
 * Countries rather than regions: the series count runs into the tens, and there
 * are not that many coherent world regions to name.
 */
const CURATED_SERIES = [
    { key: 'germany', name: 'Germany' },
    { key: 'france', name: 'France' },
    { key: 'japan', name: 'Japan' },
    { key: 'brazil', name: 'Brazil' },
    { key: 'canada', name: 'Canada' },
    { key: 'india', name: 'India' },
    { key: 'australia', name: 'Australia' },
    { key: 'mexico', name: 'Mexico' },
    { key: 'spain', name: 'Spain' },
    { key: 'italy', name: 'Italy' },
];

/**
 * The tail of the list, reached only at the top of the count scale. Named so a
 * paginated legend still reads as data, but with generated figures.
 */
const EXTRA_COUNTRIES = [
    'Norway',
    'Sweden',
    'Denmark',
    'Finland',
    'Poland',
    'Portugal',
    'Ireland',
    'Austria',
    'Belgium',
    'Chile',
    'Peru',
    'Egypt',
    'Kenya',
    'Morocco',
    'Vietnam',
    'Thailand',
    'Malaysia',
    'Singapore',
    'Turkey',
    'Greece',
    'Israel',
    'Nigeria',
    'Colombia',
    'Argentina',
];

const EXTRA_SERIES = EXTRA_COUNTRIES.map((name) => ({ key: name.toLowerCase(), name }));

export const PREVIEW_SERIES = [...CURATED_SERIES, ...EXTRA_SERIES];

/**
 * An exponential scale, since six series and seven look the same. 13 is where a
 * palette starts repeating, and the counts above it run the legend out of room
 * so its themed pagination shows. Capped at 34: the preview is rebuilt on every
 * param edit, and a dragged colour picker must not stutter.
 */
export const SERIES_COUNT_OPTIONS = [2, 3, 5, 8, 13, 21, 34];

export const MIN_SERIES_COUNT = SERIES_COUNT_OPTIONS[0];
export const MAX_SERIES_COUNT = SERIES_COUNT_OPTIONS[SERIES_COUNT_OPTIONS.length - 1];
export const DEFAULT_SERIES_COUNT = 5;

/**
 * The values cross over rather than all trending the same way, so the four
 * groups are not one silhouette repeated. The first five carry the crossover on
 * their own, a count taking a prefix of the list.
 */
const CURATED_DATA = [
    {
        quarter: 'Q1',
        germany: 168,
        france: 132,
        japan: 71,
        brazil: 94,
        canada: 43,
        india: 88,
        australia: 55,
        mexico: 121,
        spain: 39,
        italy: 97,
    },
    {
        quarter: 'Q2',
        germany: 145,
        france: 158,
        japan: 108,
        brazil: 61,
        canada: 77,
        india: 64,
        australia: 91,
        mexico: 47,
        spain: 113,
        italy: 72,
    },
    {
        quarter: 'Q3',
        germany: 201,
        france: 121,
        japan: 164,
        brazil: 88,
        canada: 52,
        india: 112,
        australia: 43,
        mexico: 96,
        spain: 71,
        italy: 134,
    },
    {
        quarter: 'Q4',
        germany: 176,
        france: 189,
        japan: 213,
        brazil: 47,
        canada: 96,
        india: 79,
        australia: 128,
        mexico: 62,
        spain: 105,
        italy: 58,
    },
];

/**
 * Deterministic, and phase-shifted by a stride that jumps rather than creeps: a
 * phase advancing smoothly with the index would fan 34 lines into a moiré
 * pattern and stack 34 bands into one wave.
 */
const generatedRevenue = (index: number, quarter: number) => {
    const base = 70 + ((index * 37) % 90);
    const swing = 15 + ((index * 53) % 45);
    return Math.round(base + swing * Math.sin(((index * 7) % 12) * 0.55 + quarter * 1.1));
};

/**
 * The hand-written quarters, extended with a figure for every country past the
 * tenth. Typed loosely because half is computed; `CURATED_DATA` keeps its
 * literal types, which is where a typo matters.
 */
export const PREVIEW_DATA: Record<string, number | string>[] = CURATED_DATA.map((row, quarter) => ({
    ...row,
    ...Object.fromEntries(EXTRA_SERIES.map(({ key }, index) => [key, generatedRevenue(index, quarter)])),
}));

export const seriesFor = (count: number) => PREVIEW_SERIES.slice(0, count);

/**
 * Full-year totals per country, for the single-series types. Derived, so the
 * donut and the bars cannot disagree about the numbers behind them.
 */
export const totalsFor = (count: number) =>
    seriesFor(count).map(({ key, name }) => ({
        country: name,
        revenue: PREVIEW_DATA.reduce((total, row) => total + (row[key] as number), 0),
    }));

/**
 * Eight, because the stock palettes run the same hue sequence and differ mainly
 * in saturation - two or three slots leave Default, Material and Vivid alike.
 */
export const THUMBNAIL_SERIES_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/** Varied enough that the columns are not six copies of one another. */
export const THUMBNAIL_DATA = [
    { period: '1', a: 38, b: 41, c: 22, d: 31, e: 14, f: 24, g: 9, h: 17 },
    { period: '2', a: 52, b: 27, c: 35, d: 18, e: 26, f: 12, g: 19, h: 8 },
    { period: '3', a: 31, b: 46, c: 19, d: 37, e: 11, f: 28, g: 15, h: 22 },
    { period: '4', a: 61, b: 24, c: 42, d: 15, e: 33, f: 17, g: 7, h: 13 },
    { period: '5', a: 43, b: 35, c: 26, d: 44, e: 18, f: 9, g: 23, h: 19 },
    { period: '6', a: 56, b: 32, c: 48, d: 21, e: 29, f: 20, g: 12, h: 25 },
];

/**
 * Two years, because the range buttons offer 1M through 1Y and All, and a
 * shorter history would leave half of them disabled. Weekdays only, so the
 * ordinal-time axis has no weekend gaps to draw or collapse.
 */
const TRADING_DAYS = 2 * 261;

export interface PreviewCandle {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/**
 * Ending today, so the chart never reads as stale and "year to date" - which the
 * range buttons measure from the end of the data - covers the current year.
 */
const tradingDaysEndingToday = (count: number) => {
    const today = new Date();
    const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days: Date[] = [];
    while (days.length < count) {
        const weekday = cursor.getDay();
        if (weekday !== 0 && weekday !== 6) {
            days.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() - 1);
    }
    return days.reverse();
};

/**
 * Seeded rather than `Math.random`, so a preview that redrew itself differently
 * on each reload cannot hide a theme change behind a data change.
 */
const seededRandom = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x1_0000_0000;
    };
};

const to2dp = (value: number) => Math.round(value * 100) / 100;

/**
 * A random walk with a slight upward bias: at five hundred bars nobody reads an
 * individual value, and only a walk gives the runs and reversals that make a
 * candlestick chart look like one.
 */
const buildCandles = (dates: Date[]): PreviewCandle[] => {
    const random = seededRandom(20260901);
    let close = 118;
    return dates.map((date) => {
        const open = close;
        close = Math.max(20, open * (1 + (random() - 0.485) * 0.035));
        // Wicks scaled to the bar's own body, so a quiet day is quiet in both.
        const wick = (random() * 0.012 + 0.002) * open;
        return {
            date,
            open: to2dp(open),
            high: to2dp(Math.max(open, close) + wick),
            low: to2dp(Math.min(open, close) - wick),
            close: to2dp(close),
            volume: Math.round(400_000 + random() * 2_600_000),
        };
    });
};

export const CANDLESTICK_DATA = buildCandles(tradingDaysEndingToday(TRADING_DAYS));
