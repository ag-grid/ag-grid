// Type definitions for @ag-grid-community/core v30.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputDateField } from "../../widgets/agInputDateField";
import { SimpleCellEditor } from "./simpleCellEditor";
export interface IDateStringCellEditorParams<TData = any, TContext = any> extends ICellEditorParams<TData, string, TContext> {
    /** Min allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    min?: string | Date;
    /** Max allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    max?: string | Date;
    /** Granularity of the value when updating. Default: 'any'. */
    step?: number;
}
export declare class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    private dataTypeService;
    constructor();
}
