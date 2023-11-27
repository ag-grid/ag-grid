import { Column } from '../entities/column';
import { BeanStub } from "../context/beanStub";
import { IRowNode } from '../interfaces/iRowNode';
export declare class ValueFormatterService extends BeanStub {
    private expressionService;
    formatValue(column: Column, node: IRowNode | null, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string | null;
}
