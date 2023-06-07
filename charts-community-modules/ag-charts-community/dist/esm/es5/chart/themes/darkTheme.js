var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { ChartTheme, OVERRIDE_SERIES_LABEL_DEFAULTS } from './chartTheme';
import { CHART_TYPES } from '../factory/chartTypes';
import { getSeriesThemeTemplate } from '../factory/seriesTypes';
var DarkTheme = /** @class */ (function (_super) {
    __extends(DarkTheme, _super);
    function DarkTheme(options) {
        return _super.call(this, options) || this;
    }
    DarkTheme.prototype.getDefaults = function () {
        var _this = this;
        var fontColor = DarkTheme.fontColor;
        var mutedFontColor = DarkTheme.mutedFontColor;
        var axisDefaults = {
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
        var seriesLabelDefaults = {
            label: {
                color: fontColor,
            },
        };
        var chartAxesDefaults = {
            axes: {
                number: __assign({}, axisDefaults),
                category: __assign({}, axisDefaults),
                time: __assign({}, axisDefaults),
            },
        };
        var chartDefaults = {
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
        var getOverridesByType = function (seriesTypes) {
            return seriesTypes.reduce(function (obj, seriesType) {
                var template = getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = _this.templateTheme(template);
                }
                return obj;
            }, {});
        };
        return this.mergeWithParentDefaults(_super.prototype.getDefaults.call(this), {
            cartesian: __assign(__assign(__assign({}, chartDefaults), chartAxesDefaults), { series: __assign({ line: __assign({}, seriesLabelDefaults), bar: __assign({}, seriesLabelDefaults), column: __assign({}, seriesLabelDefaults), histogram: __assign({}, seriesLabelDefaults) }, getOverridesByType(CHART_TYPES.cartesianTypes)) }),
            groupedCategory: __assign(__assign(__assign({}, chartDefaults), chartAxesDefaults), { series: __assign({ bar: __assign({}, seriesLabelDefaults), column: __assign({}, seriesLabelDefaults), histogram: __assign({}, seriesLabelDefaults) }, getOverridesByType(CHART_TYPES.cartesianTypes)) }),
            polar: __assign(__assign({}, chartDefaults), { series: __assign({ pie: {
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
            hierarchy: __assign(__assign({}, chartDefaults), { series: __assign({ treemap: {
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
    };
    DarkTheme.prototype.getTemplateParameters = function () {
        var result = _super.prototype.getTemplateParameters.call(this);
        result.extensions.set(OVERRIDE_SERIES_LABEL_DEFAULTS, DarkTheme.seriesLabelDefaults.label);
        return result;
    };
    DarkTheme.fontColor = 'rgb(200, 200, 200)';
    DarkTheme.mutedFontColor = 'rgb(150, 150, 150)';
    DarkTheme.seriesLabelDefaults = {
        label: {
            color: DarkTheme.fontColor,
        },
    };
    return DarkTheme;
}(ChartTheme));
export { DarkTheme };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFya1RoZW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3RoZW1lcy9kYXJrVGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLDhCQUE4QixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVoRTtJQUErQiw2QkFBVTtJQStMckMsbUJBQVksT0FBNkI7ZUFDckMsa0JBQU0sT0FBTyxDQUFDO0lBQ2xCLENBQUM7SUF2TFMsK0JBQVcsR0FBckI7UUFBQSxpQkEyS0M7UUExS0csSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN0QyxJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO1FBRWhELElBQU0sWUFBWSxHQUFHO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxLQUFLLEVBQUUsU0FBUzthQUNuQjtZQUNELEtBQUssRUFBRTtnQkFDSCxLQUFLLEVBQUUsU0FBUzthQUNuQjtZQUNELFNBQVMsRUFBRTtnQkFDUDtvQkFDSSxNQUFNLEVBQUUsaUJBQWlCO29CQUN6QixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQjthQUNKO1NBQ0osQ0FBQztRQUVGLElBQU0sbUJBQW1CLEdBQUc7WUFDeEIsS0FBSyxFQUFFO2dCQUNILEtBQUssRUFBRSxTQUFTO2FBQ25CO1NBQ0osQ0FBQztRQUVGLElBQU0saUJBQWlCLEdBQUc7WUFDdEIsSUFBSSxFQUFFO2dCQUNGLE1BQU0sZUFDQyxZQUFZLENBQ2xCO2dCQUNELFFBQVEsZUFDRCxZQUFZLENBQ2xCO2dCQUNELElBQUksZUFDRyxZQUFZLENBQ2xCO2FBQ0o7U0FDSixD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