import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
import { Component } from "../../widgets/component";
export interface ICheckboxCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, boolean, TContext> {
    /** Set to `true` for the input to be disabled. */
    disabled?: boolean;
}
export declare class CheckboxCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private eCheckbox;
    private params;
    constructor();
    init(params: ICheckboxCellRendererParams): void;
    refresh(params: ICheckboxCellRendererParams): boolean;
    private updateCheckbox;
    private onCheckboxChanged;
}
