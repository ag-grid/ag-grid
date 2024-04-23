import { UpdateChartParams } from "ag-grid-community";
import { CommonCreateChartParams } from "../../chartService";
export declare class ChartParamsValidator {
    private static legacyChartTypes;
    private static baseUpdateChartParams;
    private static isEnterprise;
    private static isValidChartType;
    private static isLegacyChartType;
    private static validateChartType;
    private static validateAgChartThemeOverrides;
    private static validateChartParamsCellRange;
    private static validateAggFunc;
    private static enterpriseChartTypeValidation;
    private static switchCategorySeriesValidation;
    private static commonUpdateValidations;
    private static cellRangeValidations;
    static validateUpdateParams(params: UpdateChartParams): boolean | UpdateChartParams;
    static validateCreateParams(params: CommonCreateChartParams): boolean | CommonCreateChartParams;
    private static validateUpdateRangeChartParams;
    private static validateUpdatePivotChartParams;
    private static validateUpdateCrossFilterChartParams;
    private static validateProperties;
}
