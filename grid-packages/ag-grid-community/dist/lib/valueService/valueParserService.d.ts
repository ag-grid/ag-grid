import { BeanStub } from '../context/beanStub';
import { Column } from '../entities/column';
import { IRowNode } from '../interfaces/iRowNode';
export declare class ValueParserService extends BeanStub {
    private expressionService;
    parseValue(column: Column, rowNode: IRowNode | null, newValue: any, oldValue: any): any;
}
