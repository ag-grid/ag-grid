// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export declare class AutoWidthCalculator {
    private rowRenderer;
    private headerRenderer;
    private gridPanel;
    private gridOptionsWrapper;
    getPreferredWidthForColumn(column: Column): number;
    private getHeaderCellForColumn(column);
    private putRowCellsIntoDummyContainer(column, eDummyContainer);
    private cloneItemIntoDummy(eCell, eDummyContainer);
}
