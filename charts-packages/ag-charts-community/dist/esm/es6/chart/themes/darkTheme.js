import { ChartTheme } from './chartTheme';
export class DarkTheme extends ChartTheme {
    getDefaults() {
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
                number: Object.assign({}, axisDefaults),
                category: Object.assign({}, axisDefaults),
                time: Object.assign({}, axisDefaults),
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
                pagination: {
                    activeStyle: {
                        fill: fontColor,
                    },
                    inactiveStyle: {
                        fill: mutedFontColor,
                    },
                    highlightStyle: {
                        fill: fontColor,
                    },
                    label: {
                        color: fontColor,
                    },
                },
            },
        };
        return this.mergeWithParentDefaults(super.getDefaults(), {
            cartesian: Object.assign(Object.assign(Object.assign({}, chartDefaults), chartAxesDefaults), { series: {
                    bar: Object.assign({}, seriesLabelDefaults),
                    column: Object.assign({}, seriesLabelDefaults),
                    histogram: Object.assign({}, seriesLabelDefaults),
                } }),
            groupedCategory: Object.assign(Object.assign(Object.assign({}, chartDefaults), chartAxesDefaults), { series: {
                    bar: Object.assign({}, seriesLabelDefaults),
                    column: Object.assign({}, seriesLabelDefaults),
                    histogram: Object.assign({}, seriesLabelDefaults),
                } }),
            polar: Object.assign(Object.assign({}, chartDefaults), { series: {
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
                } }),
            hierarchy: Object.assign(Object.assign({}, chartDefaults), { series: {
                    treemap: {
                        tileStroke: 'white',
                        groupStroke: 'white',
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
                            value: {
                                style: {
                                    color: fontColor,
                                },
                            },
                        },
                    },
                } }),
        });
    }
    constructor(options) {
        super(options);
    }
}
