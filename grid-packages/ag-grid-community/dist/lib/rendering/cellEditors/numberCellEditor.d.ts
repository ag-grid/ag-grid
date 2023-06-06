import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { AgInputNumberField } from "../../widgets/agInputNumberField";
import { SimpleCellEditor } from "./simpleCellEditor";
export interface INumberCellEditorParams<TData = any, TContext = any> extends ICellEditorParams<TData, number, TContext> {
    /** Min allowed value. */
    min?: number;
    /** Max allowed value. */
    max?: number;
    /** Number of digits allowed after the decimal point. */
    precision?: number;
    /** Granularity of the value when stepping up/down. Defaults to any value allowed. */
    step?: number;
    /** Display stepper buttons in editor. Default: `false` */
    showStepperButtons?: boolean;
}
export declare class NumberCellEditor extends SimpleCellEditor<number, INumberCellEditorParams, AgInputNumberField> {
    constructor();
}
