/**
 * How often the data updates (ms)
 */
export const UPDATE_INTERVAL = 60;

/**
 * All stock names for generated data
 */
export const STOCK_NAMES = [
    'Cow Moans',
    'Nasraq 500',
    'Fang Peng',
    'Wiltshire 4500-kbm',
    'DT PI',
    'Footsie MID',
    'Capra ibex',
    'NY composte index',
];

/**
 * Priority of showing the columns, if they fit on the screen
 */
export const COLUMN_ID_PRIORITIES = [
    "stock",
    "timeline",
    "percentageChange",
    "current",
    "last"
];

/**
 * When to filter rows for smaller screens
 * Based on `window.innerWidth`
 */
export const FILTER_ROWS_BREAKPOINT = 1020;

/**
 * Maximum number for data values
 */
export const MAX_NUMBER = 150;

/**
 * Number of values for timeline sparkline
 */
export const TIMELINE_SIZE = 20;
