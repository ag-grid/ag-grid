"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateParamsValidator = void 0;
const seriesTypeMapper_1 = require("./seriesTypeMapper");
const validateIfDefined = (validationFn) => {
    return (value) => {
        if (value == undefined)
            return true;
        return validationFn(value);
    };
};
const isString = (value) => typeof value === 'string';
const isBoolean = (value) => typeof value === 'boolean';
const isValidSeriesChartType = (value) => typeof value === 'object';
const createWarnMessage = (property, expectedType) => (value) => `AG Grid - unable to update chart as invalid params supplied:  \`${property}: ${value}\`, expected ${expectedType}.`;
class UpdateParamsValidator {
    static isValidChartType(value) {
        return UpdateParamsValidator.validChartTypes.includes(value);
    }
    static isLegacyChartType(value) {
        return UpdateParamsValidator.legacyChartTypes.includes(value);
    }
    static validateChartParams(params) {
        let paramsToValidate = params;
        switch (paramsToValidate.type) {
            case 'rangeChartUpdate':
                return UpdateParamsValidator.validateUpdateRangeChartParams(params);
            case 'pivotChartUpdate':
                return UpdateParamsValidator.validateUpdatePivotChartParams(params);
            case 'crossFilterChartUpdate':
                return UpdateParamsValidator.validateUpdateCrossFilterChartParams(params);
            default:
                console.warn(`AG Grid - Invalid value supplied for 'type': ${params.type}. It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.`);
                return false;
        }
    }
    static validateUpdateRangeChartParams(params) {
        const validations = [
            ...UpdateParamsValidator.commonValidations,
            ...UpdateParamsValidator.cellRangeValidations,
            {
                property: 'seriesChartTypes',
                validationFn: (value) => value === undefined || (Array.isArray(value) && value.every(isValidSeriesChartType)),
                warnMessage: createWarnMessage('seriesChartTypes', 'Array of SeriesChartType'),
            },
        ];
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc', 'seriesChartTypes'], 'UpdateRangeChartParams');
    }
    static validateUpdatePivotChartParams(params) {
        const validations = [
            ...UpdateParamsValidator.commonValidations,
        ];
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart'], 'UpdatePivotChartParams');
    }
    static validateUpdateCrossFilterChartParams(params) {
        const validations = [
            ...UpdateParamsValidator.commonValidations,
            ...UpdateParamsValidator.cellRangeValidations,
        ];
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc'], 'UpdateCrossFilterChartParams');
    }
    static validateProperties(params, validations, validPropertyNames, paramsType) {
        let validatedProperties = undefined;
        for (const validation of validations) {
            const { property, validationFn, warnMessage } = validation;
            if (property in params) {
                const value = params[property];
                const validationResult = validationFn(value);
                if (validationResult === true)
                    continue;
                if (validationResult === false) {
                    console.warn(warnMessage(value));
                    return false;
                }
                // If the validation function returned a 'fix' value, we need to return an updated property set.
                // First we clone the input set if there has not been a 'fix' encountered in a previous iteration:
                validatedProperties = validatedProperties || Object.assign({}, params);
                /// Then we update the cloned object with the 'fixed' value
                validatedProperties[property] = validationResult;
            }
        }
        // Check for unexpected properties
        for (const property in params) {
            if (!validPropertyNames.includes(property)) {
                console.warn(`AG Grid - Unexpected property supplied. ${paramsType} does not contain: \`${property}\`.`);
                return false;
            }
        }
        // If one or more 'fixed' values were encountered, return the updated property set
        if (validatedProperties)
            return validatedProperties;
        return true;
    }
}
exports.UpdateParamsValidator = UpdateParamsValidator;
_a = UpdateParamsValidator;
UpdateParamsValidator.validChartTypes = [
    'column',
    'groupedColumn',
    'stackedColumn',
    'normalizedColumn',
    'bar',
    'groupedBar',
    'stackedBar',
    'normalizedBar',
    'line',
    'scatter',
    'bubble',
    'pie',
    'donut',
    'area',
    'stackedArea',
    'normalizedArea',
    'histogram',
    'radialColumn',
    'radialBar',
    'radarLine',
    'radarArea',
    'nightingale',
    'rangeBar',
    'rangeArea',
    'boxPlot',
    'treemap',
    'sunburst',
    'heatmap',
    'waterfall',
    'columnLineCombo',
    'areaColumnCombo',
    'customCombo'
];
UpdateParamsValidator.legacyChartTypes = [
    'doughnut',
];
UpdateParamsValidator.validateChartType = validateIfDefined((chartType) => {
    if (_a.isValidChartType(chartType))
        return true;
    if (_a.isLegacyChartType(chartType)) {
        const renamedChartType = (0, seriesTypeMapper_1.getCanonicalChartType)(chartType);
        console.warn(`AG Grid - The chart type '${chartType}' has been deprecated. Please use '${renamedChartType}' instead.`);
        return renamedChartType;
    }
    ;
    return false;
});
UpdateParamsValidator.validateAgChartThemeOverrides = validateIfDefined((themeOverrides) => {
    // ensure supplied AgChartThemeOverrides is an object - can be improved if necessary?
    return typeof themeOverrides === 'object';
});
UpdateParamsValidator.validateChartParamsCellRange = validateIfDefined((cellRange) => {
    // ensure supplied ChartParamsCellRange is an object - can be improved if necessary?
    return typeof cellRange === 'object';
});
UpdateParamsValidator.validateAggFunc = validateIfDefined((aggFunc) => {
    // ensure supplied aggFunc is a `string` or `function` - can be improved if necessary?
    return typeof aggFunc === 'string' || typeof aggFunc === 'function';
});
UpdateParamsValidator.commonValidations = [
    { property: 'chartId', validationFn: isString, warnMessage: createWarnMessage('chartId', 'string') },
    {
        property: 'chartType',
        validationFn: UpdateParamsValidator.validateChartType,
        warnMessage: createWarnMessage('chartType', UpdateParamsValidator.validChartTypes.join(', '))
    },
    {
        property: 'chartThemeName',
        validationFn: isString,
        warnMessage: createWarnMessage('chartThemeName', 'string')
    },
    {
        property: 'chartThemeOverrides',
        validationFn: UpdateParamsValidator.validateAgChartThemeOverrides,
        warnMessage: createWarnMessage('chartThemeOverrides', 'AgChartThemeOverrides')
    },
    { property: 'unlinkChart', validationFn: isBoolean, warnMessage: createWarnMessage('unlinkChart', 'boolean') },
];
UpdateParamsValidator.cellRangeValidations = [
    {
        property: 'cellRange',
        validationFn: UpdateParamsValidator.validateChartParamsCellRange,
        warnMessage: createWarnMessage('cellRange', 'ChartParamsCellRange')
    },
    {
        property: 'suppressChartRanges',
        validationFn: isBoolean,
        warnMessage: createWarnMessage('suppressChartRanges', 'boolean')
    },
    {
        property: 'aggFunc',
        validationFn: UpdateParamsValidator.validateAggFunc,
        warnMessage: createWarnMessage('aggFunc', 'string or IAggFunc')
    },
];
