import { AgPromise, ICellEditor, ICellEditorParams } from "ag-grid-community";
import { CustomCellEditorCallbacks, CustomCellEditorProps } from "./interfaces";
export declare class CellEditorComponentProxy implements ICellEditor {
    private cellEditorParams;
    private readonly refreshProps;
    private value;
    private componentInstance?;
    private resolveInstanceCreated?;
    private instanceCreated;
    private readonly onValueChange;
    constructor(cellEditorParams: ICellEditorParams, refreshProps: () => void);
    getProps(): CustomCellEditorProps;
    getValue(): any;
    refresh(params: ICellEditorParams): void;
    setMethods(methods: CustomCellEditorCallbacks): void;
    getInstance(): AgPromise<any>;
    setRef(componentInstance: any): void;
    private getOptionalMethods;
    private updateValue;
}
