import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
import { BeanStub } from "../context/beanStub";
export declare class ValueFormatterService extends BeanStub {
    private expressionService;
    formatValue(column: Column, node: RowNode | null, $scope: any, value: any, suppliedFormatter?: (value: any) => string, useFormatterFromColumn?: boolean): string | null;
}
