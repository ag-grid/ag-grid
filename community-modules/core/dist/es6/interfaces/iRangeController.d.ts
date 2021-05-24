// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { CellPosition } from "../entities/cellPosition";
import { GridBodyComp } from "../gridBodyComp/gridBodyComp";
import { RowPosition } from "../entities/rowPosition";
import { CellComp } from "../rendering/cellComp";
export interface IRangeController {
    isEmpty(): boolean;
    removeAllCellRanges(): void;
    getCellRangeCount(cell: CellPosition): number;
    isCellInAnyRange(cell: CellPosition): boolean;
    isCellInSpecificRange(cell: CellPosition, range: CellRange): boolean;
    isBottomRightCell(cellRange: CellRange, cell: CellPosition): boolean;
    isContiguousRange(cellRange: CellRange): boolean;
    isMoreThanOneCell(): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): CellRange[];
    setRangeToCell(cell: CellPosition, appendRange?: boolean): void;
    setCellRange(params: CellRangeParams): void;
    addCellRange(params: CellRangeParams): void;
    extendLatestRangeInDirection(key: number): CellPosition | undefined;
    extendLatestRangeToCell(cell: CellPosition): void;
    updateRangeEnd(cellRange: CellRange, cellPosition: CellPosition, silent?: boolean): void;
    registerGridComp(gridPanel: GridBodyComp): void;
    getRangeStartRow(cellRange: CellRange): RowPosition;
    getRangeEndRow(cellRange: CellRange): RowPosition;
    createCellRangeFromCellRangeParams(params: CellRangeParams): CellRange | undefined;
    setCellRanges(cellRanges: CellRange[]): void;
}
export interface ISelectionHandle {
    getGui(): HTMLElement;
    getType(): SelectionHandleType;
    refresh(cellComp: CellComp): void;
}
export interface ISelectionHandleFactory {
    createSelectionHandle(type: SelectionHandleType): ISelectionHandle;
}
export declare enum SelectionHandleType {
    FILL = 0,
    RANGE = 1
}
export declare enum CellRangeType {
    VALUE = 0,
    DIMENSION = 1
}
export interface CellRange {
    id?: string;
    type?: CellRangeType;
    startRow?: RowPosition;
    endRow?: RowPosition;
    columns: Column[];
    startColumn: Column;
}
export interface CellRangeParams {
    rowStartIndex: number | null;
    rowStartPinned?: string | null;
    rowEndIndex: number | null;
    rowEndPinned?: string | null;
    columnStart?: string | Column;
    columnEnd?: string | Column;
    columns?: (string | Column)[];
}
/** @deprecated */
export interface RangeSelection {
    start: CellPosition;
    end: CellPosition;
    columns: Column[] | null;
}
/** @deprecated */
export interface AddRangeSelectionParams {
    rowStart: number;
    floatingStart: string;
    rowEnd: number;
    floatingEnd: string;
    columnStart: string | Column;
    columnEnd: string | Column;
}
