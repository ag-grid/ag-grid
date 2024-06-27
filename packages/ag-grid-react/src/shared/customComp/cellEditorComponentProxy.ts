import type { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { AgPromise } from 'ag-grid-community';

import { addOptionalMethods } from './customComponentWrapper';
import type { CustomCellEditorCallbacks, CustomCellEditorProps } from './interfaces';

export class CellEditorComponentProxy implements ICellEditor {
    private value: any;
    private componentInstance?: any;
    private resolveInstanceCreated?: () => void;
    private instanceCreated: AgPromise<void> = new AgPromise((resolve) => {
        this.resolveInstanceCreated = resolve;
    });
    private readonly onValueChange = (value: any) => this.updateValue(value);

    constructor(
        private cellEditorParams: ICellEditorParams,
        private readonly refreshProps: () => void
    ) {
        this.value = cellEditorParams.value;
    }

    public getProps(): CustomCellEditorProps {
        return {
            ...this.cellEditorParams,
            initialValue: this.cellEditorParams.value,
            value: this.value,
            onValueChange: this.onValueChange,
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
        return ['isCancelBeforeStart', 'isCancelAfterEnd', 'focusIn', 'focusOut', 'afterGuiAttached'];
    }

    private updateValue(value: any): void {
        this.value = value;
        this.refreshProps();
    }
}
