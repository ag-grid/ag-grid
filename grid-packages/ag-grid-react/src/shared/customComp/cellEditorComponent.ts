import { BaseCellEditor, ICellEditor, ICellEditorParams } from "ag-grid-community";
import { addOptionalMethods, useGridCustomComponent } from "./customComponent";

export function useGridCellEditor(methods: CellEditorMethods): void {
    useGridCustomComponent(methods);
}

export interface CustomCellEditorParams<TData = any, TValue = any, TContext = any> extends ICellEditorParams<TData, TValue, TContext> {
    initialValue: TValue | null | undefined;
    onValueChange: (value: TValue | null | undefined) => void;
}

export interface CellEditorMethods extends BaseCellEditor {}

export class CellEditorComponent implements ICellEditor {
    private value: any;

    constructor(private cellEditorParams: ICellEditorParams, private refreshProps: () => void) {
        this.value = cellEditorParams.value;
    }

    public getProps(): CustomCellEditorParams {
        return {
            ...this.cellEditorParams,
            initialValue: this.cellEditorParams.value,
            value: this.value,
            onValueChange: value => this.updateValue(value)
        };
    }

    public getValue(): any {
        return this.value;
    }

    public setMethods(methods: CellEditorMethods): void {
        addOptionalMethods(this.getOptionalMethods(), methods, this);
    }

    private getOptionalMethods(): string[] {
        return ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached'];
    }

    private updateValue(value: any): void {
        this.value = value;
        this.refreshProps();
    }
}
