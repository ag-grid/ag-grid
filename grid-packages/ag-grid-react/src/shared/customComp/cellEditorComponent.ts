import { AgPromise, ICellEditor, ICellEditorParams } from "ag-grid-community";
import { addOptionalMethods } from "./customComponent";
import { CustomCellEditorCallbacks, CustomCellEditorProps } from "./interfaces";

export class CellEditorComponent implements ICellEditor {
    private value: any;
    private componentInstance?: any;
    private resolveInstanceCreated?: () => void;
    private instanceCreated: AgPromise<void> = new AgPromise(resolve => {
        this.resolveInstanceCreated = resolve;
    });

    constructor(private cellEditorParams: ICellEditorParams, private readonly refreshProps: () => void) {
        this.value = cellEditorParams.value;
    }

    public getProps(): CustomCellEditorProps {
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

    public refresh(params: ICellEditorParams): void {
        this.cellEditorParams = params;
        this.refreshProps();
    }

    public setMethods(methods: CustomCellEditorCallbacks): void {
        addOptionalMethods(this.getOptionalMethods(), methods, this);
    }

    public getInstance(): AgPromise<any> {
        return this.instanceCreated.then(() => this.componentInstance);
    }

    public setRef(componentInstance: any): void {
        this.componentInstance = componentInstance;
        this.resolveInstanceCreated?.();
        this.resolveInstanceCreated = undefined;
    }

    private getOptionalMethods(): string[] {
        return ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached'];
    }

    private updateValue(value: any): void {
        this.value = value;
        this.refreshProps();
    }
}
