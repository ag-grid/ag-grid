import { UpdateChartParams } from "ag-grid-community";
export declare class UpdateParamsValidator {
    private static validChartTypes;
    private static validateChartType;
    private static validateAgChartThemeOverrides;
    private static validateChartParamsCellRange;
    private static validateAggFunc;
    private static commonValidations;
    private static cellRangeValidations;
    static validateChartParams(params: UpdateChartParams): boolean;
    private static validateUpdateRangeChartParams;
    private static validateUpdatePivotChartParams;
    private static validateUpdateCrossFilterChartParams;
    private static validateProperties;
}
