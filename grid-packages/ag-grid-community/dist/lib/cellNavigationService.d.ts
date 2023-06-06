import { BeanStub } from "./context/beanStub";
import { CellPosition } from "./entities/cellPositionUtils";
import { RowPosition } from "./entities/rowPositionUtils";
export declare class CellNavigationService extends BeanStub {
    private columnModel;
    private rowModel;
    private rowRenderer;
    private pinnedRowModel;
    private paginationProxy;
    getNextCellToFocus(key: string, focusedCell: CellPosition, ctrlPressed?: boolean): CellPosition | null;
    private getNextCellToFocusWithCtrlPressed;
    private getNextCellToFocusWithoutCtrlPressed;
    private isCellGoodToFocusOn;
    private getCellToLeft;
    private getCellToRight;
    getRowBelow(rowPosition: RowPosition): RowPosition | null;
    private getNextStickyPosition;
    private getCellBelow;
    private isLastRowInContainer;
    getRowAbove(rowPosition: RowPosition): RowPosition | null;
    private getCellAbove;
    private getLastBodyCell;
    private getLastFloatingTopRow;
    getNextTabbedCell(gridCell: CellPosition, backwards: boolean): CellPosition | null;
    getNextTabbedCellForwards(gridCell: CellPosition): CellPosition | null;
    getNextTabbedCellBackwards(gridCell: CellPosition): CellPosition | null;
}
