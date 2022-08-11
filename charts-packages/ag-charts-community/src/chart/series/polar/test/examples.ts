import { DATA_MARKET_SHARE } from './data';
import { AgPolarChartOptions } from '../../../agChartOptions';

export const PIE_SERIES: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
        },
    ],
};

export const PIE_SLICES_DIFFERENT_RADII: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
        },
    ],
};

const minRadius = Math.min(...DATA_MARKET_SHARE.map((d) => d.satisfaction));
const maxRadius = Math.max(...DATA_MARKET_SHARE.map((d) => d.satisfaction));

export const PIE_SLICES_DIFFERENT_RADII_SMALL_RADIUS_MIN: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMin: minRadius - 2,
        },
    ],
};

export const PIE_SLICES_DIFFERENT_RADII_LARGE_RADIUS_MIN: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMin: maxRadius + 2,
        },
    ],
};

export const PIE_SLICES_DIFFERENT_RADII_SMALL_RADIUS_MAX: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMax: minRadius - 2,
        },
    ],
};

export const PIE_SLICES_DIFFERENT_RADII_LARGE_RADIUS_MAX: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMax: maxRadius + 2,
        },
    ],
};

export const DOUGHNUT_SERIES: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            labelKey: 'os',
            angleKey: 'share',
            innerRadiusOffset: -70,
        },
    ],
};

export const GROUPED_DOUGHNUT_SERIES: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            title: {
                text: 'Market Share',
            },
            labelKey: 'os',
            angleKey: 'share',
            innerRadiusOffset: -40,
        },
        {
            type: 'pie',
            title: {
                text: 'Satisfaction',
            },
            labelKey: 'os',
            angleKey: 'satisfaction',
            outerRadiusOffset: -100,
            innerRadiusOffset: -140,
        },
    ],
};

export const DOUGHNUT_SERIES_DIFFERENT_RADII: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            title: {
                text: 'Market Share',
            },
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            innerRadiusOffset: -100,
        },
    ],
};

export const GROUPED_DOUGHNUT_SERIES_DIFFERENT_RADII: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            title: {
                text: 'Market Share',
            },
            labelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            innerRadiusOffset: -100,
        },
        {
            type: 'pie',
            title: {
                text: 'Satisfaction',
            },
            labelKey: 'os',
            angleKey: 'satisfaction',
            radiusKey: 'satisfaction',
            outerRadiusOffset: -150,
            innerRadiusOffset: -250,
        },
    ],
};
