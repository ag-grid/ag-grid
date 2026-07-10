import type { AgChartThemeOverrides } from 'ag-charts-types';

import type {
    ChartParamsCellRange,
    ChartType,
    IAggFunc,
    LogService,
    UpdateChartParams,
    UpdateCrossFilterChartParams,
    UpdatePivotChartParams,
    UpdateRangeChartParams,
    ValidationWarning,
} from 'ag-grid-community';
import { _createValidationWarning, _emitValidationWarning } from 'ag-grid-community';

import type { CommonCreateChartParams } from '../../chartService';
import { getCanonicalChartType, getSeriesTypeIfExists, isComboChart, isEnterpriseChartType } from './seriesTypeMapper';

const validateIfDefined = <I, O = never>(validationFn: (value: NonNullable<I>) => boolean | O) => {
    return (value: I | null | undefined): boolean | O => {
        if (value == undefined) {
            return true;
        }
        return validationFn(value);
    };
};

const isString = (value: any): boolean => typeof value === 'string';
const isBoolean = (value: any): boolean => typeof value === 'boolean';
const isValidSeriesChartType = (value: any): boolean => typeof value === 'object';
const createWarnMessage =
    (property: string, expectedType: string): ((value: any) => ValidationWarning) =>
    (value: any) =>
        _createValidationWarning(316, { property, value, expectedType });

const createEnterpriseMessage = (feature: string) => {
    const url = 'https://www.ag-grid.com/javascript-data-grid/integrated-charts-installation/';
    return `${feature} is not supported in AG Charts Community ('ag-charts-enterprise' hasn't been loaded). See ${url} for more details.`;
};

interface ValidationFunction<T, K extends keyof T = keyof T, V = T[K]> {
    property: K;
    validationFn: (value: T[K]) => boolean | V;
    warnMessage: (value: T[K]) => string | ValidationWarning;
    warnIfFixed?: boolean;
}

const legacyChartTypes: ChartType[] = ['doughnut'];

const baseUpdateChartParams = [
    'type',
    'chartId',
    'chartType',
    'chartThemeName',
    'chartThemeOverrides',
    'unlinkChart',
] as const;

function isValidChartType(value: string): value is ChartType {
    return !!getSeriesTypeIfExists(value as ChartType) || isComboChart(value as ChartType);
}

function isLegacyChartType(value: string): value is ChartType {
    return legacyChartTypes.includes(value as ChartType);
}

const makeValidateChartType = (log: LogService) =>
    validateIfDefined<UpdateChartParams['chartType'], Exclude<ChartType, 'doughnut'>>((chartType) => {
        if (isValidChartType(chartType)) {
            return true;
        }
        if (isLegacyChartType(chartType)) {
            const renamedChartType = getCanonicalChartType(chartType);
            log.deprecated(312, { chartType, renamedChartType });
            return renamedChartType;
        }
        return false;
    });

const validateAgChartThemeOverrides = validateIfDefined<AgChartThemeOverrides>((themeOverrides) => {
    // ensure supplied AgChartThemeOverrides is an object - can be improved if necessary?
    return typeof themeOverrides === 'object';
});

const validateChartParamsCellRange = validateIfDefined<ChartParamsCellRange>((cellRange) => {
    // ensure supplied ChartParamsCellRange is an object - can be improved if necessary?
    return typeof cellRange === 'object';
});

const validateAggFunc = validateIfDefined<string | IAggFunc>((aggFunc) => {
    // ensure supplied aggFunc is a `string` or `function` - can be improved if necessary?
    return typeof aggFunc === 'string' || typeof aggFunc === 'function';
});

const enterpriseChartTypeValidation: (isEnterprise: boolean) => ValidationFunction<any> = (isEnterprise) => ({
    property: 'chartType',
    validationFn: validateIfDefined<ChartType>(
        (chartType) => isEnterprise || !chartType || !isEnterpriseChartType(chartType)
    ),
    warnMessage: (chartType) => createEnterpriseMessage(`The '${chartType}' chart type`),
});

const switchCategorySeriesValidation: (isEnterprise: boolean) => ValidationFunction<any> = (isEnterprise) => ({
    property: 'switchCategorySeries',
    validationFn: validateIfDefined<boolean, undefined>((switchCategorySeries) => {
        if (!switchCategorySeries || isEnterprise) {
            return true;
        }
        return undefined;
    }),
    warnMessage: () => createEnterpriseMessage(`'switchCategorySeries' has been ignored as it`),
    warnIfFixed: true,
});

const commonUpdateValidations: (log: LogService) => ValidationFunction<any>[] = (log) => [
    { property: 'chartId', validationFn: isString, warnMessage: createWarnMessage('chartId', 'string') },
    {
        property: 'chartType',
        validationFn: makeValidateChartType(log),
        warnMessage: createWarnMessage('chartType', 'ChartType'),
    },
    {
        property: 'chartThemeName',
        validationFn: isString,
        warnMessage: createWarnMessage('chartThemeName', 'string'),
    },
    {
        property: 'chartThemeOverrides',
        validationFn: validateAgChartThemeOverrides,
        warnMessage: createWarnMessage('chartThemeOverrides', 'AgChartThemeOverrides'),
    },
    { property: 'unlinkChart', validationFn: isBoolean, warnMessage: createWarnMessage('unlinkChart', 'boolean') },
];

const cellRangeValidations: (isEnterprise: boolean) => ValidationFunction<any>[] = (isEnterprise) => [
    {
        property: 'cellRange',
        validationFn: validateChartParamsCellRange,
        warnMessage: createWarnMessage('cellRange', 'ChartParamsCellRange'),
    },
    {
        property: 'suppressChartRanges',
        validationFn: isBoolean,
        warnMessage: createWarnMessage('suppressChartRanges', 'boolean'),
    },
    {
        property: 'aggFunc',
        validationFn: validateAggFunc,
        warnMessage: createWarnMessage('aggFunc', 'string or IAggFunc'),
    },
    switchCategorySeriesValidation(isEnterprise),
];

export function validateUpdateParams(
    params: UpdateChartParams,
    isEnterprise: boolean,
    log: LogService
): boolean | UpdateChartParams {
    const paramsToValidate = params;
    switch (paramsToValidate.type) {
        case 'rangeChartUpdate':
            return validateUpdateRangeChartParams(params as UpdateRangeChartParams, isEnterprise, log);
        case 'pivotChartUpdate':
            return validateUpdatePivotChartParams(params as UpdatePivotChartParams, log);
        case 'crossFilterChartUpdate':
            return validateUpdateCrossFilterChartParams(params as UpdateCrossFilterChartParams, isEnterprise, log);
        default:
            log.warn(320, {
                property: "'type'",
                allowed: ['rangeChartUpdate', 'pivotChartUpdate', 'crossFilterChartUpdate'],
                value: params.type,
            });
            return false;
    }
}

export function validateCreateParams(
    params: CommonCreateChartParams,
    isEnterprise: boolean,
    log: LogService
): boolean | CommonCreateChartParams {
    return validateProperties(
        params,
        [enterpriseChartTypeValidation(isEnterprise), switchCategorySeriesValidation(isEnterprise)],
        log
    );
}

function validateUpdateRangeChartParams(
    params: UpdateRangeChartParams,
    isEnterprise: boolean,
    log: LogService
): boolean | UpdateRangeChartParams {
    const validations: ValidationFunction<any>[] = [
        ...commonUpdateValidations(log),
        enterpriseChartTypeValidation(isEnterprise),
        ...cellRangeValidations(isEnterprise),
        {
            property: 'seriesChartTypes',
            validationFn: (value: any) =>
                value === undefined || (Array.isArray(value) && value.every(isValidSeriesChartType)),
            warnMessage: createWarnMessage('seriesChartTypes', 'Array of SeriesChartType'),
        },
        {
            property: 'useGroupColumnAsCategory',
            validationFn: isBoolean,
            warnMessage: createWarnMessage('useGroupColumnAsCategory', 'boolean'),
        },
    ];

    return validateProperties(
        params,
        validations,
        log,
        [
            ...baseUpdateChartParams,
            'cellRange',
            'suppressChartRanges',
            'switchCategorySeries',
            'aggFunc',
            'seriesChartTypes',
            'seriesGroupType',
            'useGroupColumnAsCategory',
        ],
        'UpdateRangeChartParams'
    );
}

function validateUpdatePivotChartParams(
    params: UpdatePivotChartParams,
    log: LogService
): boolean | UpdatePivotChartParams {
    const validations: ValidationFunction<any>[] = [...commonUpdateValidations(log)];

    return validateProperties(params, validations, log, [...baseUpdateChartParams], 'UpdatePivotChartParams');
}

function validateUpdateCrossFilterChartParams(
    params: UpdateCrossFilterChartParams,
    isEnterprise: boolean,
    log: LogService
): boolean | UpdateCrossFilterChartParams {
    const validations: ValidationFunction<any>[] = [
        ...commonUpdateValidations(log),
        ...cellRangeValidations(isEnterprise),
    ];

    return validateProperties(
        params,
        validations,
        log,
        [...baseUpdateChartParams, 'cellRange', 'suppressChartRanges', 'aggFunc'],
        'UpdateCrossFilterChartParams'
    );
}

function validateProperties<T extends object>(
    params: T,
    validations: ValidationFunction<T>[],
    log: LogService,
    validPropertyNames?: (keyof T)[],
    paramsType?: string
): boolean | T {
    let validatedProperties: T | undefined = undefined;
    for (const validation of validations) {
        const { property, validationFn, warnMessage, warnIfFixed } = validation;
        if (property in params) {
            const value = params[property];
            const validationResult = validationFn(value);
            if (validationResult === true) {
                continue;
            }
            if (validationResult === false) {
                _emitValidationWarning(warnMessage(value), log);
                return false;
            }
            // If the validation function returned a 'fix' value, we need to return an updated property set.
            // First we clone the input set if there has not been a 'fix' encountered in a previous iteration:
            validatedProperties = validatedProperties || { ...params };
            /// Then we update the cloned object with the 'fixed' value
            validatedProperties[property] = validationResult;
            if (warnIfFixed) {
                _emitValidationWarning(warnMessage(value), log);
            }
        }
    }

    if (validPropertyNames) {
        // Check for unexpected properties
        for (const property of Object.keys(params)) {
            if (!validPropertyNames.includes(property as keyof T)) {
                log.warn(313, { paramsType, property });
                return false;
            }
        }
    }

    // If one or more 'fixed' values were encountered, return the updated property set
    if (validatedProperties) {
        return validatedProperties;
    }

    return true;
}
