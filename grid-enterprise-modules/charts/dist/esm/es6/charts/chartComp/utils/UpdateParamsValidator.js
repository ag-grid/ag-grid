const validateIfDefined = (validationFn) => {
    return (value) => {
        if (value === undefined)
            return true;
        return validationFn(value);
    };
};
const isString = (value) => typeof value === 'string';
const isBoolean = (value) => typeof value === 'boolean';
const isValidSeriesChartType = (value) => typeof value === 'object';
const createWarnMessage = (property, expectedType) => (value) => `AG Grid - unable to update chart as invalid params supplied:  \`${property}: ${value}\`, expected ${expectedType}.`;
export class UpdateParamsValidator {
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
        for (const validation of validations) {
            const { property, validationFn, warnMessage } = validation;
            if (property in params) {
                const value = params[property];
                if (!validationFn(value)) {
                    console.warn(warnMessage(value));
                    return false;
                }
            }
        }
        // Check for unexpected properties
        for (const property in params) {
            if (!validPropertyNames.includes(property)) {
                console.warn(`AG Grid - Unexpected property supplied. ${paramsType} does not contain: \`${property}\`.`);
                return false;
            }
        }
        return true;
    }
}
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
    'doughnut',
    'area',
    'stackedArea',
    'normalizedArea',
    'histogram',
    'columnLineCombo',
    'areaColumnCombo',
    'customCombo'
];
UpdateParamsValidator.validateChartType = validateIfDefined((chartType) => {
    return UpdateParamsValidator.validChartTypes.includes(chartType);
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
