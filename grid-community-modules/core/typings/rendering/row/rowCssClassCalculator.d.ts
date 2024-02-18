import { RowNode } from "../../entities/rowNode";
import { GridOptionsService } from "../../gridOptionsService";
import { StylingService } from "../../styling/stylingService";
import { ColumnPinnedType } from "../../entities/column";
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
export declare class RowCssClassCalculator {
    stylingService: StylingService;
    gridOptionsService: GridOptionsService;
    getInitialRowClasses(params: RowCssClassCalculatorParams): string[];
    processClassesFromGridOptions(rowNode: RowNode): string[];
    private preProcessRowClassRules;
    processRowClassRules(rowNode: RowNode, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    calculateRowLevel(rowNode: RowNode): number;
}
