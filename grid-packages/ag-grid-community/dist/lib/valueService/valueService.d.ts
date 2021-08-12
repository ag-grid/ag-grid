import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ValueService extends BeanStub {
    private expressionService;
    private columnModel;
    private valueCache;
    private cellExpressions;
    private initialised;
    init(): void;
    getValue(column: Column, rowNode?: RowNode | null, forFilter?: boolean, ignoreAggData?: boolean): any;
    private getOpenedGroup;
    setValue(rowNode: RowNode, colKey: string | Column, newValue: any, eventSource?: string): void;
    private setValueUsingField;
    private executeFilterValueGetter;
    private executeValueGetter;
    private getValueCallback;
    getKeyForNode(col: Column, rowNode: RowNode): any;
}
