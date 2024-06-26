import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
export interface RowCssClassCalculatorParams {
    rowNode: RowNode;
    rowIsEven: boolean;
    rowLevel: number;
    fullWidthRow?: boolean;
    firstRowOnPage: boolean;
    lastRowOnPage: boolean;
    printLayout: boolean;
    expandable: boolean;
    pinned: ColumnPinnedType;
    extraCssClass?: string;
    rowFocused?: boolean;
    fadeRowIn?: boolean;
}
export declare class RowCssClassCalculator extends BeanStub implements NamedBean {
    beanName: "rowCssClassCalculator";
    private stylingService;
    wireBeans(beans: BeanCollection): void;
    getInitialRowClasses(params: RowCssClassCalculatorParams): string[];
    processClassesFromGridOptions(rowNode: RowNode): string[];
    private preProcessRowClassRules;
    processRowClassRules(rowNode: RowNode, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    calculateRowLevel(rowNode: RowNode): number;
}
