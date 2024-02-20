"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreemapChartProxy = void 0;
const hierarchicalChartProxy_1 = require("./hierarchicalChartProxy");
class TreemapChartProxy extends hierarchicalChartProxy_1.HierarchicalChartProxy {
    constructor(params) {
        super(params);
    }
    getSeries(params, labelKey) {
        var _a, _b;
        const { fields } = params;
        // Treemap charts support up to two input series, corresponding to size and color respectively
        const [sizeField, colorField] = fields;
        // Combine the size and color series into a single composite series
        return [
            {
                type: this.standaloneChartType,
                // The label key is generated internally by the hierarchy processing and is not user-configurable
                labelKey,
                // Size and color fields are inferred from the range data
                sizeKey: sizeField === null || sizeField === void 0 ? void 0 : sizeField.colId,
                sizeName: (_a = sizeField === null || sizeField === void 0 ? void 0 : sizeField.displayName) !== null && _a !== void 0 ? _a : undefined,
                colorKey: colorField === null || colorField === void 0 ? void 0 : colorField.colId,
                colorName: (_b = colorField === null || colorField === void 0 ? void 0 : colorField.displayName) !== null && _b !== void 0 ? _b : undefined,
            },
        ];
    }
    getChartThemeDefaults() {
        return {
            treemap: {
                gradientLegend: {
                    gradient: {
                        preferredLength: 200,
                    },
                },
            },
        };
    }
    transformData(data, categoryKey, categoryAxis) {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    }
    crossFilteringReset() {
        // cross filtering is not currently supported in treemap charts
    }
}
exports.TreemapChartProxy = TreemapChartProxy;
