// Type definitions for @ag-grid-community/core v26.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { RowCssClassCalculator } from "./row/rowCssClassCalculator";
export declare class AutoWidthCalculator extends BeanStub {
    private rowRenderer;
    private ctrlsService;
    rowCssClassCalculator: RowCssClassCalculator;
    private centerRowContainerCon;
    private postConstruct;
    getPreferredWidthForColumn(column: Column, skipHeader?: boolean): number;
    private getHeaderCellForColumn;
    private putRowCellsIntoDummyContainer;
    private cloneItemIntoDummy;
}
