import { ChartTheme, OVERRIDE_SERIES_LABEL_DEFAULTS } from './chartTheme';
import { CHART_TYPES } from '../factory/chartTypes';
import { getSeriesThemeTemplate } from '../factory/seriesTypes';
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
                const template = getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = this.templateTheme(template);
                }
                return obj;
            }, {});
        };
        return this.mergeWithParentDefaults(super.getDefaults(), {
            cartesian: Object.assign(Object.assign(Object.assign({}, chartDefaults), chartAxesDefaults), { series: Object.assign({ line: Object.assign({}, seriesLabelDefaults), bar: Object.assign({}, seriesLabelDefaults), column: Object.assign({}, seriesLabelDefaults), histogram: Object.assign({}, seriesLabelDefaults) }, getOverridesByType(CHART_TYPES.cartesianTypes)) }),
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
    getTemplateParameters() {
        const result = super.getTemplateParameters();
        result.extensions.set(OVERRIDE_SERIES_LABEL_DEFAULTS, DarkTheme.seriesLabelDefaults.label);
        return result;
    }
}
DarkTheme.fontColor = 'rgb(200, 200, 200)';
DarkTheme.mutedFontColor = 'rgb(150, 150, 150)';
DarkTheme.seriesLabelDefaults = {
    label: {
        color: DarkTheme.fontColor,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFya1RoZW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3RoZW1lcy9kYXJrVGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSw4QkFBOEIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMxRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEUsTUFBTSxPQUFPLFNBQVUsU0FBUSxVQUFVO0lBK0xyQyxZQUFZLE9BQTZCO1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBdkxTLFdBQVc7UUFDakIsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN0QyxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO1FBRWhELE1BQU0sWUFBWSxHQUFHO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxLQUFLLEVBQUUsU0FBUzthQUNuQjtZQUNELEtBQUssRUFBRTtnQkFDSCxLQUFLLEVBQUUsU0FBUzthQUNuQjtZQUNELFNBQVMsRUFBRTtnQkFDUDtvQkFDSSxNQUFNLEVBQUUsaUJBQWlCO29CQUN6QixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQjthQUNKO1NBQ0osQ0FBQztRQUVGLE1BQU0sbUJBQW1CLEdBQUc7WUFDeEIsS0FBSyxFQUFFO2dCQUNILEtBQUssRUFBRSxTQUFTO2FBQ25CO1NBQ0osQ0FBQztRQUVGLE1BQU0saUJBQWlCLEdBQUc7WUFDdEIsSUFBSSxFQUFFO2dCQUNGLE1BQU0sb0JBQ0MsWUFBWSxDQUNsQjtnQkFDRCxRQUFRLG9CQUNELFlBQVksQ0FDbEI7Z0JBQ0QsSUFBSSxvQkFDRyxZQUFZLENBQ2xCO2FBQ0o7U0FDSixDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUc7WUFDbEIsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRSxpQkFBaUI7YUFDMUI7WUFDRCxLQUFLLEVBQUU7Z0JBQ0gsS0FBSyxFQUFFLFNBQVM7YUFDbkI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLGNBQWM7YUFDeEI7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osSUFBSSxFQUFFO29CQUNGLEtBQUssRUFBRTt3QkFDSCxLQUFLLEVBQUUsU0FBUztxQkFDbkI7aUJBQ0o7Z0JBQ0QsVUFBVSxFQUFFO29CQUNSLFdBQVcsRUFBRTt3QkFDVCxJQUFJLEVBQUUsU0FBUztxQkFDbEI7b0JBQ0QsYUFBYSxFQUFFO3dCQUNYLElBQUksRUFBRSxjQUFjO3FCQUN2QjtvQkFDRCxjQUFjLEVBQUU7d0JBQ1osSUFBSSxFQUFFLFNBQVM7cUJBQ2xCO29CQUNELEtBQUssRUFBRTt3QkFDSCxLQUFLLEVBQUUsU0FBUztxQkFDbkI7aUJBQ0o7YUFDSjtTQUNKLENBQUM7UUFFRixNQUFNLGtCQUFrQixHQUFHLENBQUMsV0FBcUIsRUFBRSxFQUFFO1lBQ2pELE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDMUMsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3BELElBQUksUUFBUSxFQUFFO29CQUNWLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRDtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsRUFBRSxFQUF5QixDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3JELFNBQVMsZ0RBQ0YsYUFBYSxHQUNiLGlCQUFpQixLQUNwQixNQUFNLGtCQUNGLElBQUksb0JBQ0csbUJBQW1CLEdBRTFCLEdBQUcsb0JBQ0ksbUJBQW1CLEdBRTFCLE1BQU0sb0JBQ0MsbUJBQW1CLEdBRTFCLFNBQVMsb0JBQ0YsbUJBQW1CLEtBRXZCLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFFeEQ7WUFDRCxlQUFlLGdEQUNSLGFBQWEsR0FDYixpQkFBaUIsS0FDcEIsTUFBTSxrQkFDRixHQUFHLG9CQUNJLG1CQUFtQixHQUUxQixNQUFNLG9CQUNDLG1CQUFtQixHQUUxQixTQUFTLG9CQUNGLG1CQUFtQixLQUV2QixrQkFBa0IsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLElBRXhEO1lBQ0QsS0FBSyxrQ0FDRSxhQUFhLEtBQ2hCLE1BQU0sa0JBQ0YsR0FBRyxFQUFFO3dCQUNELFlBQVksRUFBRTs0QkFDVixLQUFLLEVBQUUsU0FBUzt5QkFDbkI7d0JBQ0QsV0FBVyxFQUFFOzRCQUNULEtBQUssRUFBRSxTQUFTO3lCQUNuQjt3QkFDRCxLQUFLLEVBQUU7NEJBQ0gsS0FBSyxFQUFFLFNBQVM7eUJBQ25CO3dCQUNELFdBQVcsRUFBRTs0QkFDVCxLQUFLLEVBQUUsU0FBUzt5QkFDbkI7cUJBQ0osSUFDRSxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBRXBEO1lBQ0QsU0FBUyxrQ0FDRixhQUFhLEtBQ2hCLE1BQU0sa0JBQ0YsT0FBTyxFQUFFO3dCQUNMLFVBQVUsRUFBRSxPQUFPO3dCQUNuQixXQUFXLEVBQUUsT0FBTzt3QkFDcEIsS0FBSyxFQUFFOzRCQUNILEtBQUssRUFBRSxTQUFTO3lCQUNuQjt3QkFDRCxRQUFRLEVBQUU7NEJBQ04sS0FBSyxFQUFFLGNBQWM7eUJBQ3hCO3dCQUNELE1BQU0sRUFBRTs0QkFDSixLQUFLLEVBQUU7Z0NBQ0gsS0FBSyxFQUFFLFNBQVM7NkJBQ25COzRCQUNELE1BQU0sRUFBRTtnQ0FDSixLQUFLLEVBQUUsU0FBUzs2QkFDbkI7NEJBQ0QsS0FBSyxFQUFFO2dDQUNILEtBQUssRUFBRSxTQUFTOzZCQUNuQjs0QkFDRCxLQUFLLEVBQUU7Z0NBQ0gsS0FBSyxFQUFFO29DQUNILEtBQUssRUFBRSxTQUFTO2lDQUNuQjs2QkFDSjt5QkFDSjtxQkFDSixJQUNFLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFFeEQ7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMscUJBQXFCO1FBQzNCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUzRixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOztBQTVMTSxtQkFBUyxHQUFHLG9CQUFvQixDQUFDO0FBQ2pDLHdCQUFjLEdBQUcsb0JBQW9CLENBQUM7QUFFdEMsNkJBQW1CLEdBQUc7SUFDekIsS0FBSyxFQUFFO1FBQ0gsS0FBSyxFQUFFLFNBQVMsQ0FBQyxTQUFTO0tBQzdCO0NBQ0osQ0FBQyJ9