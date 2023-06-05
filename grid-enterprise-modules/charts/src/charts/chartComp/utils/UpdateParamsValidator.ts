import {
    AgChartThemeOverrides,
    ChartParamsCellRange,
    ChartType,
    IAggFunc,
    UpdateChartParams,
    UpdateCrossFilterChartParams,
    UpdatePivotChartParams,
    UpdateRangeChartParams,
    SeriesChartType,
    Column
} from "@ag-grid-community/core";

const validateIfDefined = <T>(validationFn: (value: T) => boolean) => {
    return (value: T | undefined): boolean => {
        if (value === undefined) return true;
        return validationFn(value);
    };
};

const isString = (value: any): boolean => typeof value === 'string';
const isBoolean = (value: any): boolean => typeof value === 'boolean';
const isValidSeriesChartType = (value: any): boolean => typeof value === 'object';
const createWarnMessage = (property: string, expectedType: string): ((value: any) => string) =>
    (value: any) => `AG Grid - unable to update chart as invalid params supplied:  \`${property}: ${value}\`, expected ${expectedType}.`;

interface ValidationFunction<T> {
    property: keyof T;
    validationFn: (value: any) => boolean;
    warnMessage: (value: any) => string;
}

export class UpdateParamsValidator {
    private static validChartTypes: ChartType[] = [
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

    private static validateChartType = validateIfDefined<ChartType>((chartType) => {
        return UpdateParamsValidator.validChartTypes.includes(chartType);
    });

    private static validateAgChartThemeOverrides = validateIfDefined<AgChartThemeOverrides>((themeOverrides) => {
        // ensure supplied AgChartThemeOverrides is an object - can be improved if necessary?
        return typeof themeOverrides === 'object';
    });

    private static validateChartParamsCellRange = validateIfDefined<ChartParamsCellRange>((cellRange) => {
        // ensure supplied ChartParamsCellRange is an object - can be improved if necessary?
        return typeof cellRange === 'object';
    });

    private static validateAggFunc = validateIfDefined<string | IAggFunc>((aggFunc) => {
        // ensure supplied aggFunc is a `string` or `function` - can be improved if necessary?
        return typeof aggFunc === 'string' || typeof aggFunc === 'function';
    });

    private static commonValidations: ValidationFunction<any>[] = [
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

    private static cellRangeValidations: ValidationFunction<any>[] = [
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

    public static validateChartParams(params: UpdateChartParams): boolean {
        let paramsToValidate = params as UpdateChartParams;
        switch (paramsToValidate.type) {
            case 'rangeChartUpdate':
                return UpdateParamsValidator.validateUpdateRangeChartParams(params as UpdateRangeChartParams);
            case 'pivotChartUpdate':
                return UpdateParamsValidator.validateUpdatePivotChartParams(params as UpdatePivotChartParams);
            case 'crossFilterChartUpdate':
                return UpdateParamsValidator.validateUpdateCrossFilterChartParams(params as UpdateCrossFilterChartParams);
            default:
                console.warn(`AG Grid - Invalid value supplied for 'type': ${params.type}. It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.`);
                return false;
        }
    }

    private static validateUpdateRangeChartParams(params: UpdateRangeChartParams): boolean {
        const validations: ValidationFunction<any>[] = [
            ...UpdateParamsValidator.commonValidations,
            ...UpdateParamsValidator.cellRangeValidations,
            {
                property: 'seriesChartTypes',
                validationFn: (value: any) => value === undefined || (Array.isArray(value) && value.every(isValidSeriesChartType)),
                warnMessage: createWarnMessage('seriesChartTypes', 'Array of SeriesChartType'),
            },
        ];

        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc', 'seriesChartTypes'], 'UpdateRangeChartParams');
    }

    private static validateUpdatePivotChartParams(params: UpdatePivotChartParams): boolean {
        const validations: ValidationFunction<any>[] = [
            ...UpdateParamsValidator.commonValidations,
        ];

        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart'], 'UpdatePivotChartParams');
    }

    private static validateUpdateCrossFilterChartParams(params: UpdateCrossFilterChartParams): boolean {
        const validations: ValidationFunction<any>[] = [
            ...UpdateParamsValidator.commonValidations,
            ...UpdateParamsValidator.cellRangeValidations,
        ];

        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc'], 'UpdateCrossFilterChartParams');
    }

    private static validateProperties<T>(params: T, validations: ValidationFunction<T>[], validPropertyNames: (keyof T)[], paramsType: string): boolean {
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
            if (!validPropertyNames.includes(property as keyof T)) {
                console.warn(`AG Grid - Unexpected property supplied. ${paramsType} does not contain: \`${property}\`.`);
                return false;
            }
        }
        return true;
    }

}