import { ChartTheme } from "./chartTheme";

export class DarkTheme extends ChartTheme {

    getOverrides(): any {
        const fontColor = 'rgb(200, 200, 200)';
        const mutedFontColor = 'rgb(150, 150, 150)';

        const axisOverrides = {
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

        const chartOverrides = {
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
                    ...axisOverrides
                },
                category: {
                    ...axisOverrides
                },
                time: {
                    ...axisOverrides
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

        return this.mergeWithParentOverrides({
            cartesian: {
                ...chartOverrides,
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
                ...chartOverrides,
                series: {
                    pie: {
                        ...seriesLabelDefaults
                    }
                }
            }
        });
    }

    constructor() {
        super();
    }
}