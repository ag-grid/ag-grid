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
import { getCanonicalChartType } from './seriesTypeMapper';

const validateIfDefined = <I, O = never>(validationFn: (value: NonNullable<I>) => boolean | O) => {
    return (value: I | null | undefined): boolean | O => {
        if (value == undefined) return true;
        return validationFn(value as NonNullable<I>);
    };
};

const isString = (value: any): boolean => typeof value === 'string';
const isBoolean = (value: any): boolean => typeof value === 'boolean';
const isValidSeriesChartType = (value: any): boolean => typeof value === 'object';
const createWarnMessage = (property: string, expectedType: string): ((value: any) => string) =>
    (value: any) => `AG Grid - unable to update chart as invalid params supplied:  \`${property}: ${value}\`, expected ${expectedType}.`;

interface ValidationFunction<T, K extends keyof T = keyof T, V = T[K]> {
    property: K;
    validationFn: (value: T[K]) => boolean | V;
    warnMessage: (value: T[K]) => string;
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

    private static legacyChartTypes: ChartType[] = [
        'doughnut',
    ];

    private static isValidChartType(value: string): value is ChartType {
        return UpdateParamsValidator.validChartTypes.includes(value as ChartType);
    }

    private static isLegacyChartType(value: string): value is ChartType {
        return UpdateParamsValidator.legacyChartTypes.includes(value as ChartType);
    }

    private static validateChartType = validateIfDefined<UpdateChartParams['chartType'], Exclude<ChartType, 'doughnut'>>((chartType) => {
        if (this.isValidChartType(chartType)) return true;
        if (this.isLegacyChartType(chartType)) {
            const renamedChartType = getCanonicalChartType(chartType)
            console.warn(`AG Grid - The chart type '${chartType}' has been deprecated. Please use '${renamedChartType}' instead.`);
            return renamedChartType;
        };
        return false;
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

    public static validateChartParams(params: UpdateChartParams): boolean | UpdateChartParams {
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

    private static validateUpdateRangeChartParams(params: UpdateRangeChartParams): boolean | UpdateRangeChartParams {
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

    private static validateUpdatePivotChartParams(params: UpdatePivotChartParams): boolean | UpdatePivotChartParams {
        const validations: ValidationFunction<any>[] = [
            ...UpdateParamsValidator.commonValidations,
        ];

        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart'], 'UpdatePivotChartParams');
    }

    private static validateUpdateCrossFilterChartParams(params: UpdateCrossFilterChartParams): boolean | UpdateCrossFilterChartParams {
        const validations: ValidationFunction<any>[] = [
            ...UpdateParamsValidator.commonValidations,
            ...UpdateParamsValidator.cellRangeValidations,
        ];

        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc'], 'UpdateCrossFilterChartParams');
    }

    private static validateProperties<T extends object>(params: T, validations: ValidationFunction<T>[], validPropertyNames: (keyof T)[], paramsType: string): boolean | T {
        let validatedProperties: T | undefined = undefined;
        for (const validation of validations) {
            const { property, validationFn, warnMessage } = validation;
            if (property in params) {
                const value = params[property];
                const validationResult = validationFn(value);
                if (validationResult === true) continue;
                if (validationResult === false) {
                    console.warn(warnMessage(value));
                    return false;
                }
                // If the validation function returned a 'fix' value, we need to return an updated property set.
                // First we clone the input set if there has not been a 'fix' encountered in a previous iteration:
                validatedProperties = validatedProperties || { ...params };
                /// Then we update the cloned object with the 'fixed' value
                validatedProperties[property] = validationResult;
            }
        }

        // Check for unexpected properties
        for (const property in params) {
            if (!validPropertyNames.includes(property as keyof T)) {
                console.warn(`AG Grid - Unexpected property supplied. ${paramsType} does not contain: \`${property}\`.`);
                return false;
            }
        }

        // If one or more 'fixed' values were encountered, return the updated property set
        if (validatedProperties) return validatedProperties;

        return true;
    }

}