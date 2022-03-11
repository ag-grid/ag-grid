import { BeanStub } from "./context/beanStub";
import { CellPosition } from "./entities/cellPosition";
import { RowPosition } from "./entities/rowPosition";
export declare class CellNavigationService extends BeanStub {
    private columnModel;
    private rowModel;
    private pinnedRowModel;
    private paginationProxy;
    getNextCellToFocus(key: string, lastCellToFocus: CellPosition): CellPosition | null;
    private isCellGoodToFocusOn;
    private getCellToLeft;
    private getCellToRight;
    getRowBelow(rowPosition: RowPosition): RowPosition | null;
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
