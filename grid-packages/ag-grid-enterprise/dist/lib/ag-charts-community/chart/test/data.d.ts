export declare const DATA_MEAN_SEA_LEVEL: {
    time: number;
    mm: number;
}[];
export declare const DATA_REVENUE: {
    date: Date;
    value: number;
}[];
export declare const DATA_POSITIVE_LOG_AXIS: {
    os: string;
    share: number;
}[];
export declare const DATA_NEGATIVE_LOG_AXIS: {
    os: string;
    share: number;
}[];
export declare const DATA_FRACTIONAL_LOG_AXIS: {
    os: string;
    share: number;
}[];
export declare const DATA_ZERO_EXTENT_LOG_AXIS: {
    os: string;
    share: number;
}[];
export declare const DATA_INVALID_DOMAIN_LOG_AXIS: {
    os: string;
    share: number;
}[];
export declare const DATA_APPLE_REVENUE_BY_PRODUCT: {
    quarter: string;
    iphone: number;
    mac: number;
    ipad: number;
    wearables: number;
    services: number;
}[];
export declare const DATA_VISITORS: ({
    year: Date;
    visitors: number;
} | {
    year: Date;
    visitors: null;
} | {
    year: Date;
    visitors: undefined;
})[];
export declare const DATA_TIME_SENSOR: {
    time: Date;
    sensor: number;
}[];
export declare const DATA_SINGLE_DATUM_TIME_SENSOR: {
    time: Date;
    sensor: number;
}[];
export declare const DATA_INTERNET_EXPLORER_MARKET_SHARE_BAD_Y_VALUE: ({
    year: string;
    ie: number;
} | {
    year: string;
    ie: string;
})[];
export declare const DATA_MISSING_X: ({
    x: number;
    y1: number;
    y2: number;
} | {
    x: undefined;
    y1: number;
    y2: number;
})[];
export declare const DATA_TIME_MISSING_X: ({
    x: Date;
    y1: number;
    y2: number;
    y?: undefined;
} | {
    x: null;
    y: number;
    y2: number;
    y1?: undefined;
})[];
export declare const DATA_BROWSER_MARKET_SHARE: ({
    year: string;
    ie: number;
    firefox: number;
    safari: number;
    chrome: number;
} | {
    year: string;
    ie: number;
    firefox: number;
    safari: number;
    chrome: undefined;
} | {
    year: string;
    ie: number;
    firefox: undefined;
    safari: number;
    chrome: number;
} | {
    year: string;
    ie: number;
    firefox: undefined;
    safari: undefined;
    chrome: number;
})[];
export declare const DATA_BROWSER_MARKET_SHARE_MISSING_FIRST_Y: ({
    year: string;
    ie: number;
    firefox: number;
    chrome: number;
    safari?: undefined;
} | {
    year: string;
    ie: number;
    firefox: number;
    safari: number;
    chrome: number;
})[];
export declare const DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY: {
    grouping: {};
    totalWinnings: number;
}[];
export declare const DATA_TOTAL_GAME_WINNINGS_GROUPED_BY_COUNTRY_EXTENDED: {
    grouping: {};
    totalWinnings: number;
}[];
