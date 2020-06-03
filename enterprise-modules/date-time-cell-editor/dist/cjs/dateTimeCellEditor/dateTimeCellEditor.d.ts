import { ICellEditor, PopupComponent, ICellEditorParams } from "@ag-grid-community/core";
export interface IDateTimeCellEditorParams extends ICellEditorParams {
    defaultDate?: Date | (() => Date);
    valueToDate?: (value: any) => Date;
    dateToValue?: (date: Date) => any;
}
export declare class DateTimeCellEditor extends PopupComponent implements ICellEditor {
    private static TEMPLATE;
    private params;
    private cancelled;
    private originalValue;
    private selectedDate;
    private editor;
    constructor();
    init(params: IDateTimeCellEditorParams): void;
    afterGuiAttached(): void;
    private handleValueSelect;
    isPopup(): boolean;
    getPopupPosition(): string;
    isCancelAfterEnd(): boolean;
    getValue(): any;
}
