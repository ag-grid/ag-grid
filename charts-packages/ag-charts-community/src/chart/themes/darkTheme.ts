import { ChartTheme } from './chartTheme';
import { AgChartThemeOptions } from '../agChartOptions';

export class DarkTheme extends ChartTheme {
    protected getDefaults(): typeof ChartTheme['defaults'] {
        const fontColor = 'rgb(200, 200, 200)';
        const mutedFontColor = 'rgb(150, 150, 150)';

        const axisDefaults = {
            title: {
                color: fontColor,
            },
            label: {
                color: fontColor,
            },
            gridStyle: [
                {
                    stroke: 'rgb(88, 88, 88)',
                    lineDash: [4, 2],
                },
            ],
        };

        const seriesLabelDefaults = {
            label: {
                color: fontColor,
            },
        };

        const chartAxesDefaults = {
            axes: {
                number: {
                    ...axisDefaults,
                },
                category: {
                    ...axisDefaults,
                },
                time: {
                    ...axisDefaults,
                },
            },
        };

        const chartDefaults = {
            background: {
                fill: 'rgb(34, 38, 41)',
            },
            title: {
                color: fontColor,
            },
            subtitle: {
                color: mutedFontColor,
            },
            legend: {
                item: {
                    label: {
                        color: fontColor,
                    },
                },
            },
        };

        return this.mergeWithParentDefaults(super.getDefaults(), {
            cartesian: {
                ...chartDefaults,
                ...chartAxesDefaults,
                series: {
                    bar: {
                        ...seriesLabelDefaults,
                    },
                    column: {
                        ...seriesLabelDefaults,
                    },
                    histogram: {
                        ...seriesLabelDefaults,
                    },
                },
            },
            groupedCategory: {
                ...chartDefaults,
                ...chartAxesDefaults,
                series: {
                    bar: {
                        ...seriesLabelDefaults,
                    },
                    column: {
                        ...seriesLabelDefaults,
                    },
                    histogram: {
                        ...seriesLabelDefaults,
                    },
                },
            },
            polar: {
                ...chartDefaults,
                series: {
                    pie: {
                        calloutLabel: {
                            color: fontColor,
                        },
                        sectorLabel: {
                            color: fontColor,
                        },
                        title: {
                            color: fontColor,
                        },
                        innerLabels: {
                            color: fontColor,
                        },
                    },
                },
            },
            hierarchy: {
                ...chartDefaults,
                series: {
                    treemap: {
                        title: {
                            color: fontColor,
                        },
                        subtitle: {
                            color: mutedFontColor,
                        },
                        labels: {
                            large: {
                                color: fontColor,
                            },
                            medium: {
                                color: fontColor,
                            },
                            small: {
                                color: fontColor,
                            },
                            color: {
                                color: fontColor,
                            },
                        },
                    },
                },
            },
        });
    }

    constructor(options?: AgChartThemeOptions) {
        super(options);
    }
}
