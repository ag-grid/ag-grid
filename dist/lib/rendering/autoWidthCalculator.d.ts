// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export interface GuiProvider {
    (): HTMLElement;
}
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
