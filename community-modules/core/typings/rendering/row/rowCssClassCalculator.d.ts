import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { StylingService } from "../../styling/stylingService";
export interface RowCssClassCalculatorParams {
    rowNode: RowNode;
    rowIsEven: boolean;
    rowLevel: number;
    fullWidthRow?: boolean;
    firstRowOnPage: boolean;
    lastRowOnPage: boolean;
    printLayout: boolean;
    expandable: boolean;
    pinned?: string | null;
    extraCssClass?: string;
    rowFocused?: boolean;
    fadeRowIn?: boolean;
    scope?: any;
}
export declare class RowCssClassCalculator {
    stylingService: StylingService;
    gridOptionsWrapper: GridOptionsWrapper;
    getInitialRowClasses(params: RowCssClassCalculatorParams): string[];
    processClassesFromGridOptions(rowNode: RowNode, scope: any): string[];
    private preProcessRowClassRules;
    processRowClassRules(rowNode: RowNode, scope: any, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    calculateRowLevel(rowNode: RowNode): number;
}
