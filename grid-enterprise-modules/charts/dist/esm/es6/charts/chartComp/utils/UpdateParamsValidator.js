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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUGFyYW1zVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvdXRpbHMvVXBkYXRlUGFyYW1zVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWFBLE1BQU0saUJBQWlCLEdBQUcsQ0FBSSxZQUFtQyxFQUFFLEVBQUU7SUFDakUsT0FBTyxDQUFDLEtBQW9CLEVBQVcsRUFBRTtRQUNyQyxJQUFJLEtBQUssS0FBSyxTQUFTO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDckMsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFVLEVBQVcsRUFBRSxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNwRSxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQVUsRUFBVyxFQUFFLENBQUMsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDO0FBQ3RFLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxLQUFVLEVBQVcsRUFBRSxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNsRixNQUFNLGlCQUFpQixHQUFHLENBQUMsUUFBZ0IsRUFBRSxZQUFvQixFQUE0QixFQUFFLENBQzNGLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxtRUFBbUUsUUFBUSxLQUFLLEtBQUssZ0JBQWdCLFlBQVksR0FBRyxDQUFDO0FBUXpJLE1BQU0sT0FBTyxxQkFBcUI7SUFpRnZCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUF5QjtRQUN2RCxJQUFJLGdCQUFnQixHQUFHLE1BQTJCLENBQUM7UUFDbkQsUUFBUSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7WUFDM0IsS0FBSyxrQkFBa0I7Z0JBQ25CLE9BQU8scUJBQXFCLENBQUMsOEJBQThCLENBQUMsTUFBZ0MsQ0FBQyxDQUFDO1lB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