// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridCell } from "../entities/gridCell";
export declare class MouseEventService {
    private gridPanel;
    private columnController;
    private rowModel;
    private floatingRowModel;
    private gridOptionsWrapper;
    getCellForMouseEvent(mouseEvent: MouseEvent): GridCell;
    private getFloating(mouseEvent);
    private getFloatingRowIndex(mouseEvent, floating);
    private getRowIndex(mouseEvent, floating);
    private getBodyRowIndex(mouseEvent);
    private getContainer(mouseEvent);
    private getColumn(mouseEvent);
    private getColumnsForContainer(container);
    private getXForContainer(container, mouseEvent);
}
