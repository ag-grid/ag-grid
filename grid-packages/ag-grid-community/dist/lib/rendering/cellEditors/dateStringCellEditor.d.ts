import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputDateField } from "../../widgets/agInputDateField";
import { SimpleCellEditor } from "./simpleCellEditor";
export interface IDateStringCellEditorParams<TData = any, TContext = any> extends ICellEditorParams<TData, string, TContext> {
    /** Min allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    min?: string | Date;
    /** Max allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    max?: string | Date;
    /**
     * Size of the value change when stepping up/down, starting from `min` or the initial value if provided.
     * Step is also the difference between valid values.
     * If the user-provided value isn't a multiple of the step value from the starting value, it will be considered invalid.
     * Defaults to any value allowed.
     */
    step?: number;
}
export declare class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    private dataTypeService;
    constructor();
}
