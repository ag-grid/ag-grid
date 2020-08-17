import { ChartTheme } from "./chartTheme";
import { AgChartThemeOverrides } from "../agChartOptions";

export class DarkTheme extends ChartTheme {

    getDefaults(): any {
        const fontColor = 'rgb(200, 200, 200)';
        const mutedFontColor = 'rgb(150, 150, 150)';

        const axisDefaults = {
            title: {
                color: fontColor
            },
            label: {
                color: fontColor
            },
            gridStyle: [{
                stroke: 'rgb(88, 88, 88)',
                lineDash: [4, 2]
            }]
        };

        const seriesLabelDefaults = {
            label: {
                color: fontColor
            }
        };

        const chartDefaults = {
            background: {
                fill: 'rgb(52, 52, 52)'
            },
            title: {
                color: fontColor
            },
            subtitle: {
                color: mutedFontColor
            },
            axes: {
                number: {
                    ...axisDefaults
                },
                category: {
                    ...axisDefaults
                },
                time: {
                    ...axisDefaults
                }
            },
            legend: {
                item: {
                    label: {
                        color: fontColor
                    }
                }
            }
        };

        return this.mergeWithParentDefaults({
            cartesian: {
                ...chartDefaults,
                series: {
                    bar: {
                        ...seriesLabelDefaults
                    },
                    column: {
                        ...seriesLabelDefaults
                    },
                    histogram: {
                        ...seriesLabelDefaults
                    }
                }
            },
            polar: {
                ...chartDefaults,
                series: {
                    pie: {
                        ...seriesLabelDefaults
                    }
                }
            }
        });
    }

    constructor(overrides?: AgChartThemeOverrides) {
        super(overrides);
    }
}