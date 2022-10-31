// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { RowCssClassCalculator } from "./row/rowCssClassCalculator";
import { ColumnGroup } from "../entities/columnGroup";
export declare class AutoWidthCalculator extends BeanStub {
    private rowRenderer;
    private ctrlsService;
    rowCssClassCalculator: RowCssClassCalculator;
    private centerRowContainerCtrl;
    private postConstruct;
    getPreferredWidthForColumn(column: Column, skipHeader?: boolean): number;
    getPreferredWidthForColumnGroup(columnGroup: ColumnGroup): number;
    private addElementsToContainerAndGetWidth;
    private getHeaderCellForColumn;
    private cloneItemIntoDummy;
}
