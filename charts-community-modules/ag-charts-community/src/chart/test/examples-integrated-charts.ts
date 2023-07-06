import type { AgCartesianChartOptions, AgChartOptions, AgChartTheme, AgPolarChartOptions } from '../agChartOptions';

const BASE_THEME: AgChartTheme = {
    baseTheme: {
        baseTheme: {
            baseTheme: {
                baseTheme: 'ag-default',
            },
            overrides: {
                common: {
                    axes: {
                        number: {
                            title: {
                                _enabledFromTheme: true,
                            },
                        },
                        category: {
                            title: {
                                _enabledFromTheme: true,
                            },
                        },
                        groupedCategory: {
                            title: {
                                _enabledFromTheme: true,
                            },
                        },
                        log: {
                            title: {
                                _enabledFromTheme: true,
                            },
                        },
                        time: {
                            title: {
                                _enabledFromTheme: true,
                            },
                        },
                    },
                    padding: {
                        top: 20,
                        right: 30,
                        bottom: 20,
                        left: 20,
                    },
                },
                pie: {
                    series: {
                        title: {
                            _enabledFromTheme: true,
                        },
                        calloutLabel: {
                            _enabledFromTheme: true,
                        },
                        sectorLabel: {
                            enabled: false,
                            _enabledFromTheme: true,
                        },
                    },
                },
            },
        },
        overrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Medals by Age',
                },
            },
            column: {
                axes: {
                    category: {
                        label: {
                            rotation: 0,
                        },
                    },
                },
            },
        },
    } as any,
    overrides: {},
};

function addToString({ id, ...others }) {
    return {
        toString() {
            return id;
        },
        id,
        ...others,
    };
}

const COMMON = {
    theme: BASE_THEME,
    mode: 'integrated',
    data: [
        {
            age: addToString({
                id: 0,
                value: 18,
            }),
            gold: 0,
            silver: 1,
            bronze: 1,
        },
        {
            age: addToString({
                id: 1,
                value: 19,
            }),
            gold: 1,
            silver: 0,
            bronze: 0,
        },
        {
            age: addToString({
                id: 2,
                value: 21,
            }),
            gold: 1,
            silver: 0,
            bronze: 1,
        },
        {
            age: addToString({
                id: 3,
                value: 22,
            }),
            gold: 2,
            silver: 1,
            bronze: 5,
        },
        {
            age: addToString({
                id: 4,
                value: 23,
            }),
            gold: 1,
            silver: 4,
            bronze: 1,
        },
        {
            age: addToString({
                id: 5,
                value: 24,
            }),
            gold: 1,
            silver: 3,
            bronze: 1,
        },
        {
            age: addToString({
                id: 6,
                value: 25,
            }),
            gold: 3,
            silver: 4,
            bronze: 6,
        },
        {
            age: addToString({
                id: 7,
                value: 26,
            }),
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 8,
                value: 27,
            }),
            gold: 3,
            silver: 3,
            bronze: 4,
        },
        {
            age: addToString({
                id: 9,
                value: 28,
            }),
            gold: 3,
            silver: 1,
            bronze: 1,
        },
        {
            age: addToString({
                id: 10,
                value: 29,
            }),
            gold: 0,
            silver: 2,
            bronze: 0,
        },
        {
            age: addToString({
                id: 11,
                value: 30,
            }),
            gold: 1,
            silver: 0,
            bronze: 1,
        },
        {
            age: addToString({
                id: 12,
                value: 31,
            }),
            gold: 2,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 13,
                value: 32,
            }),
            gold: 1,
            silver: 1,
            bronze: 2,
        },
        {
            age: addToString({
                id: 14,
                value: 33,
            }),
            gold: 0,
            silver: 3,
            bronze: 2,
        },
        {
            age: addToString({
                id: 15,
                value: 34,
            }),
            gold: 1,
            silver: 0,
            bronze: 0,
        },
        {
            age: addToString({
                id: 16,
                value: 35,
            }),
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 17,
                value: 36,
            }),
            gold: 0,
            silver: 0,
            bronze: 1,
        },
        {
            age: addToString({
                id: 18,
                value: 38,
            }),
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 19,
                value: 39,
            }),
            gold: 1,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 20,
                value: 40,
            }),
            gold: 1,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 21,
                value: 42,
            }),
            gold: 0,
            silver: 1,
            bronze: 1,
        },
        {
            age: addToString({
                id: 22,
                value: 45,
            }),
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 23,
                value: 47,
            }),
            gold: 0,
            silver: 0,
            bronze: 1,
        },
        {
            age: addToString({
                id: 24,
                value: 55,
            }),
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: addToString({
                id: 25,
                value: 61,
            }),
            gold: 0,
            silver: 1,
            bronze: 0,
        },
    ],
};

const COLUMN_BASIC: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'column',
            grouped: true,
            stacked: false,
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'column',
            grouped: true,
            stacked: false,
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'column',
            grouped: true,
            stacked: false,
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const COLUMN_STACKED: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'column',
            grouped: false,
            stacked: true,
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'column',
            grouped: false,
            stacked: true,
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'column',
            grouped: false,
            stacked: true,
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const COLUMN_STACKED_NORMALISED: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            label: {},
        },
    ],
    series: [
        {
            type: 'column',
            grouped: false,
            stacked: true,
            normalizedTo: 100,
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'column',
            grouped: false,
            stacked: true,
            normalizedTo: 100,
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'column',
            grouped: false,
            stacked: true,
            normalizedTo: 100,
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const BAR_BASIC: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
        },
    ],
    series: [
        {
            type: 'bar',
            grouped: true,
            stacked: false,
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'bar',
            grouped: true,
            stacked: false,
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'bar',
            grouped: true,
            stacked: false,
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const BAR_STACKED: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
        },
    ],
    series: [
        {
            type: 'bar',
            grouped: false,
            stacked: true,
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'bar',
            grouped: false,
            stacked: true,
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'bar',
            grouped: false,
            stacked: true,
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const BAR_STACKED_NORMALISED: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
            label: {},
        },
    ],
    series: [
        {
            type: 'bar',
            grouped: false,
            stacked: true,
            normalizedTo: 100,
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'bar',
            grouped: false,
            stacked: true,
            normalizedTo: 100,
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'bar',
            grouped: false,
            stacked: true,
            normalizedTo: 100,
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const COMMON_POLAR = {
    ...COMMON,
    data: [
        {
            age: 18,
            gold: 0,
            silver: 1,
            bronze: 1,
        },
        {
            age: 19,
            gold: 1,
            silver: 0,
            bronze: 0,
        },
        {
            age: 21,
            gold: 1,
            silver: 0,
            bronze: 1,
        },
        {
            age: 22,
            gold: 2,
            silver: 1,
            bronze: 5,
        },
        {
            age: 23,
            gold: 1,
            silver: 4,
            bronze: 1,
        },
        {
            age: 24,
            gold: 1,
            silver: 3,
            bronze: 1,
        },
        {
            age: 25,
            gold: 3,
            silver: 4,
            bronze: 6,
        },
        {
            age: 26,
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: 27,
            gold: 3,
            silver: 3,
            bronze: 4,
        },
        {
            age: 28,
            gold: 3,
            silver: 1,
            bronze: 1,
        },
        {
            age: 29,
            gold: 0,
            silver: 2,
            bronze: 0,
        },
        {
            age: 30,
            gold: 1,
            silver: 0,
            bronze: 1,
        },
        {
            age: 31,
            gold: 2,
            silver: 1,
            bronze: 0,
        },
        {
            age: 32,
            gold: 1,
            silver: 1,
            bronze: 2,
        },
        {
            age: 33,
            gold: 0,
            silver: 3,
            bronze: 2,
        },
        {
            age: 34,
            gold: 1,
            silver: 0,
            bronze: 0,
        },
        {
            age: 35,
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: 36,
            gold: 0,
            silver: 0,
            bronze: 1,
        },
        {
            age: 38,
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: 39,
            gold: 1,
            silver: 1,
            bronze: 0,
        },
        {
            age: 40,
            gold: 1,
            silver: 1,
            bronze: 0,
        },
        {
            age: 42,
            gold: 0,
            silver: 1,
            bronze: 1,
        },
        {
            age: 45,
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: 47,
            gold: 0,
            silver: 0,
            bronze: 1,
        },
        {
            age: 55,
            gold: 0,
            silver: 1,
            bronze: 0,
        },
        {
            age: 61,
            gold: 0,
            silver: 1,
            bronze: 0,
        },
    ],
};

const PIE_BASIC: AgPolarChartOptions = {
    ...COMMON_POLAR,
    series: [
        {
            type: 'pie',
            angleKey: 'gold',
            angleName: 'Gold',
            sectorLabelKey: 'gold',
            calloutLabelKey: 'age',
            calloutLabelName: 'Age',
        },
    ],
};

const DOUGHNUT_BASIC: AgPolarChartOptions = {
    ...COMMON_POLAR,
    series: [
        {
            type: 'pie',
            angleKey: 'gold',
            angleName: 'Gold',
            sectorLabelKey: 'gold',
            calloutLabelKey: 'age',
            calloutLabelName: 'Age',
            outerRadiusOffset: 0,
            innerRadiusOffset: -20,
            title: {
                text: 'Gold',
                showInLegend: true,
            },
            calloutLine: {
                colors: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
            },
        },
        {
            type: 'pie',
            angleKey: 'silver',
            angleName: 'Silver',
            sectorLabelKey: 'silver',
            calloutLabelKey: 'age',
            calloutLabelName: 'Age',
            outerRadiusOffset: -40,
            innerRadiusOffset: -60,
            title: {
                text: 'Silver',
                showInLegend: true,
            },
            calloutLine: {
                colors: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
            },
        },
        {
            type: 'pie',
            angleKey: 'bronze',
            angleName: 'Bronze',
            sectorLabelKey: 'bronze',
            calloutLabelKey: 'age',
            calloutLabelName: 'Age',
            outerRadiusOffset: -80,
            innerRadiusOffset: -100,
            title: {
                text: 'Bronze',
                showInLegend: true,
            },
            calloutLine: {
                colors: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
            },
        },
    ],
};

const LINE_BASIC: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'line',
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
        },
        {
            type: 'line',
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
        },
        {
            type: 'line',
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
        },
    ],
};

const SCATTER_BASIC: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'scatter',
            xKey: 'gold',
            xName: 'Gold',
            yKey: 'silver',
            yName: 'Silver',
            title: 'Silver vs Gold',
            labelKey: 'age',
            labelName: 'Age',
        },
    ],
};

const BUBBLE_BASIC: AgCartesianChartOptions = {
    ...COMMON,
    series: [
        {
            type: 'scatter',
            xKey: 'gold',
            xName: 'Gold',
            yKey: 'silver',
            yName: 'Silver',
            title: 'Silver vs Gold',
            sizeKey: 'bronze',
            sizeName: 'Bronze',
            labelKey: 'age',
            labelName: 'Age',
        },
    ],
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
};

const AREA_BASIC: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
            stacked: false,
        },
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
            stacked: false,
        },
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
            stacked: false,
        },
    ],
};

const AREA_STACKED: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
            stacked: true,
        },
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
            stacked: true,
        },
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
            stacked: true,
        },
    ],
};

const AREA_STACKED_NORMALISED: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'gold',
            yName: 'Gold',
            normalizedTo: 100,
            stacked: true,
        },
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'silver',
            yName: 'Silver',
            normalizedTo: 100,
            stacked: true,
        },
        {
            type: 'area',
            xKey: 'age',
            xName: 'Age',
            yKey: 'bronze',
            yName: 'Bronze',
            normalizedTo: 100,
            stacked: true,
        },
    ],
};

const HISTOGRAM: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
    series: [
        {
            type: 'histogram',
            xKey: 'gold',
            xName: 'Gold',
            yName: 'Frequency',
            areaPlot: false,
        },
    ],
};

const COMBO_LINE: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
            gridStyle: [{}],
        },
        {
            type: 'number',
            keys: ['gold', 'silver', 'bronze'],
            position: 'left',
        },
    ],
    series: [
        {
            type: 'column',
            xKey: 'age',
            yKey: 'gold',
            yName: 'Gold',
            stacked: false,
            grouped: true,
        },
        {
            type: 'column',
            xKey: 'age',
            yKey: 'silver',
            yName: 'Silver',
            stacked: false,
            grouped: true,
        },
        {
            type: 'line',
            xKey: 'age',
            yKey: 'bronze',
            yName: 'Bronze',
            // stacked: false,
        },
    ],
};

const COMBO_AREA: AgCartesianChartOptions = {
    ...COMMON,
    axes: [
        {
            type: 'category',
            position: 'bottom',
            gridStyle: [{}],
        },
        {
            type: 'number',
            keys: ['gold', 'silver', 'bronze'],
            position: 'left',
        },
    ],
    series: [
        {
            type: 'area',
            xKey: 'age',
            yKey: 'gold',
            yName: 'Gold',
            stacked: true,
        },
        {
            type: 'area',
            xKey: 'age',
            yKey: 'silver',
            yName: 'Silver',
            stacked: true,
        },
        {
            type: 'column',
            xKey: 'age',
            yKey: 'bronze',
            yName: 'Bronze',
            stacked: false,
            grouped: true,
        },
    ],
};

type TestCase = {
    options: AgChartOptions;
};
export const EXAMPLES: Record<string, TestCase> = {
    COLUMN_BASIC: {
        options: COLUMN_BASIC,
    },
    COLUMN_STACKED: {
        options: COLUMN_STACKED,
    },
    COLUMN_STACKED_NORMALISED: {
        options: COLUMN_STACKED_NORMALISED,
    },
    BAR_BASIC: {
        options: BAR_BASIC,
    },
    BAR_STACKED: {
        options: BAR_STACKED,
    },
    BAR_STACKED_NORMALISED: {
        options: BAR_STACKED_NORMALISED,
    },
    PIE_BASIC: {
        options: PIE_BASIC,
    },
    DOUGHNUT_BASIC: {
        options: DOUGHNUT_BASIC,
    },
    LINE_BASIC: {
        options: LINE_BASIC,
    },
    SCATTER_BASIC: {
        options: SCATTER_BASIC,
    },
    BUBBLE_BASIC: {
        options: BUBBLE_BASIC,
    },
    AREA_BASIC: {
        options: AREA_BASIC,
    },
    AREA_STACKED: {
        options: AREA_STACKED,
    },
    AREA_STACKED_NORMALISED: {
        options: AREA_STACKED_NORMALISED,
    },
    HISTOGRAM: {
        options: HISTOGRAM,
    },
    COMBO_LINE: {
        options: COMBO_LINE,
    },
    COMBO_AREA: {
        options: COMBO_AREA,
    },
};
