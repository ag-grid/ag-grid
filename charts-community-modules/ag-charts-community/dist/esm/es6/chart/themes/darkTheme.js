import { ChartTheme } from './chartTheme';
import { CHART_TYPES } from '../chartTypes';
export class DarkTheme extends ChartTheme {
    constructor(options) {
        super(options);
    }
    getDefaults() {
        const fontColor = DarkTheme.fontColor;
        const mutedFontColor = DarkTheme.mutedFontColor;
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
        const getOverridesByType = (seriesTypes) => {
            return seriesTypes.reduce((obj, seriesType) => {
                if (Object.prototype.hasOwnProperty.call(DarkTheme.seriesDarkThemeOverrides, seriesType)) {
                    obj[seriesType] = DarkTheme.seriesDarkThemeOverrides[seriesType]({
                        seriesLabelDefaults: DarkTheme.seriesLabelDefaults,
                    });
                }
                return obj;
            }, {});
        };
        return this.mergeWithParentDefaults(super.getDefaults(), {
            cartesian: Object.assign(Object.assign(Object.assign({}, chartDefaults), chartAxesDefaults), { series: Object.assign({ bar: Object.assign({}, seriesLabelDefaults), column: Object.assign({}, seriesLabelDefaults), histogram: Object.assign({}, seriesLabelDefaults) }, getOverridesByType(CHART_TYPES.cartesianTypes)) }),
            groupedCategory: Object.assign(Object.assign(Object.assign({}, chartDefaults), chartAxesDefaults), { series: Object.assign({ bar: Object.assign({}, seriesLabelDefaults), column: Object.assign({}, seriesLabelDefaults), histogram: Object.assign({}, seriesLabelDefaults) }, getOverridesByType(CHART_TYPES.cartesianTypes)) }),
            polar: Object.assign(Object.assign({}, chartDefaults), { series: Object.assign({ pie: {
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
                    } }, getOverridesByType(CHART_TYPES.polarTypes)) }),
            hierarchy: Object.assign(Object.assign({}, chartDefaults), { series: Object.assign({ treemap: {
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
                    } }, getOverridesByType(CHART_TYPES.hierarchyTypes)) }),
        });
    }
}
DarkTheme.fontColor = 'rgb(200, 200, 200)';
DarkTheme.mutedFontColor = 'rgb(150, 150, 150)';
DarkTheme.seriesLabelDefaults = {
    label: {
        color: DarkTheme.fontColor,
    },
};
DarkTheme.seriesDarkThemeOverrides = {};
