import { AgChartThemeOptions } from '../agChartOptions';
import { ChartTheme, OVERRIDE_SERIES_LABEL_DEFAULTS } from './chartTheme';
import { CHART_TYPES } from '../factory/chartTypes';
import { getSeriesThemeTemplate } from '../factory/seriesTypes';

export class DarkTheme extends ChartTheme {
    static fontColor = 'rgb(200, 200, 200)';
    static mutedFontColor = 'rgb(150, 150, 150)';

    static seriesLabelDefaults = {
        label: {
            color: DarkTheme.fontColor,
        },
    };

    protected getDefaults(): (typeof ChartTheme)['defaults'] {
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

        const getOverridesByType = (seriesTypes: string[]) => {
            return seriesTypes.reduce((obj, seriesType) => {
                const template = getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = this.templateTheme(template);
                }
                return obj;
            }, {} as Record<string, any>);
        };

        return this.mergeWithParentDefaults(super.getDefaults(), {
            cartesian: {
                ...chartDefaults,
                ...chartAxesDefaults,
                series: {
                    line: {
                        ...seriesLabelDefaults,
                    },
                    bar: {
                        ...seriesLabelDefaults,
                    },
                    column: {
                        ...seriesLabelDefaults,
                    },
                    histogram: {
                        ...seriesLabelDefaults,
                    },
                    ...getOverridesByType(CHART_TYPES.cartesianTypes),
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
                    ...getOverridesByType(CHART_TYPES.cartesianTypes),
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
                    ...getOverridesByType(CHART_TYPES.polarTypes),
                },
            },
            hierarchy: {
                ...chartDefaults,
                series: {
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
                    ...getOverridesByType(CHART_TYPES.hierarchyTypes),
                },
            },
        });
    }

    protected getTemplateParameters() {
        const result = super.getTemplateParameters();

        result.extensions.set(OVERRIDE_SERIES_LABEL_DEFAULTS, DarkTheme.seriesLabelDefaults.label);

        return result;
    }

    constructor(options?: AgChartThemeOptions) {
        super(options);
    }
}
