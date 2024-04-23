import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { IRowNode } from "../interfaces/iRowNode";
export declare class ValueService extends BeanStub {
    private expressionService;
    private columnModel;
    private valueCache;
    private dataTypeService;
    private cellExpressions;
    private isTreeData;
    private initialised;
    private isSsrm;
    init(): void;
    getValue(column: Column, rowNode?: IRowNode | null, forFilter?: boolean, ignoreAggData?: boolean): any;
    parseValue(column: Column, rowNode: IRowNode | null, newValue: any, oldValue: any): any;
    formatValue(column: Column, node: IRowNode | null, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string | null;
    private getOpenedGroup;
    /**
     * Sets the value of a GridCell
     * @param rowNode The `RowNode` to be updated
     * @param colKey The `Column` to be updated
     * @param newValue The new value to be set
     * @param eventSource The event source
     * @returns `True` if the value has been updated, otherwise`False`.
     */
    setValue(rowNode: IRowNode, colKey: string | Column, newValue: any, eventSource?: string): boolean;
    private callColumnCellValueChangedHandler;
    private setValueUsingField;
    private executeFilterValueGetter;
    private executeValueGetter;
    private getValueCallback;
    getKeyForNode(col: Column, rowNode: IRowNode): any;
}
