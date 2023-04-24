import { DATA_MARKET_SHARE, DATA_MANY_LONG_LABELS } from './data';
import { AgPolarChartOptions } from '../../../agChartOptions';

export const PIE_SERIES: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
        },
    ],
};

export const PIE_SECTORS_DIFFERENT_RADII: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
        },
    ],
};

const minRadius = Math.min(...DATA_MARKET_SHARE.map((d) => d.satisfaction));
const maxRadius = Math.max(...DATA_MARKET_SHARE.map((d) => d.satisfaction));

export const PIE_SECTORS_DIFFERENT_RADII_SMALL_RADIUS_MIN: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMin: minRadius - 2,
        },
    ],
};

export const PIE_SECTORS_DIFFERENT_RADII_LARGE_RADIUS_MIN: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMin: maxRadius + 2,
        },
    ],
};

export const PIE_SECTORS_DIFFERENT_RADII_SMALL_RADIUS_MAX: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMax: minRadius - 2,
        },
    ],
};

export const PIE_SECTORS_DIFFERENT_RADII_LARGE_RADIUS_MAX: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            radiusMax: maxRadius + 2,
        },
    ],
};

export const PIE_SECTORS_LABELS: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            sectorLabelKey: 'share',
            sectorLabel: {
                color: 'white',
            },
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
            calloutLabelKey: 'os',
            angleKey: 'share',
            innerRadiusOffset: -70,
        },
    ],
};

export const DOUGHNUT_SERIES_INNER_TEXT: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'os',
            angleKey: 'share',
            innerRadiusOffset: -30,
            innerLabels: [
                { text: '35%', color: 'white', fontSize: 50 },
                { text: 'Market', margin: 10 },
            ],
            innerCircle: {
                fill: '#a3a2a1',
            },
        },
    ],
};

export const DOUGHNUT_SERIES_RATIO: AgPolarChartOptions = {
    title: {
        text: 'Market Share',
    },
    data: DATA_MARKET_SHARE,
    series: [
        {
            type: 'pie',
            sectorLabelKey: 'share',
            angleKey: 'share',
            outerRadiusRatio: 0.9,
            innerRadiusRatio: 0.2,
            sectorLabel: {
                positionRatio: 0.7,
            },
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
            calloutLabelKey: 'os',
            angleKey: 'share',
            innerRadiusOffset: -40,
        },
        {
            type: 'pie',
            title: {
                text: 'Satisfaction',
            },
            calloutLabelKey: 'os',
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
            calloutLabelKey: 'os',
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
            calloutLabelKey: 'os',
            angleKey: 'share',
            radiusKey: 'satisfaction',
            innerRadiusOffset: -100,
        },
        {
            type: 'pie',
            title: {
                text: 'Satisfaction',
            },
            calloutLabelKey: 'os',
            angleKey: 'satisfaction',
            radiusKey: 'satisfaction',
            outerRadiusOffset: -150,
            innerRadiusOffset: -250,
        },
    ],
};

export const PIE_CALLOUT_LABELS_COLLISIONS: AgPolarChartOptions = {
    title: {
        text: 'Many Long Labels',
    },
    data: DATA_MANY_LONG_LABELS,
    series: [
        {
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            calloutLabel: {
                minAngle: 1,
            },
        },
    ],
};
