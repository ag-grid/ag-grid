import { Column } from "../entities/column";
import { CellPosition } from "../entities/cellPosition";
import { RowPosition } from "../entities/rowPosition";
import { CellCtrl } from "../rendering/cell/cellCtrl";
export interface IRangeService {
    isEmpty(): boolean;
    removeAllCellRanges(): void;
    getCellRangeCount(cell: CellPosition): number;
    isCellInAnyRange(cell: CellPosition): boolean;
    isCellInSpecificRange(cell: CellPosition, range: CellRange): boolean;
    isBottomRightCell(cellRange: CellRange, cell: CellPosition): boolean;
    isContiguousRange(cellRange: CellRange): boolean;
    isMoreThanOneCell(): boolean;
    areAllRangesAbleToMerge(): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): CellRange[];
    setRangeToCell(cell: CellPosition, appendRange?: boolean): void;
    setCellRange(params: CellRangeParams): void;
    addCellRange(params: CellRangeParams): void;
    extendLatestRangeInDirection(key: string): CellPosition | undefined;
    extendLatestRangeToCell(cell: CellPosition): void;
    updateRangeEnd(cellRange: CellRange, cellPosition: CellPosition, silent?: boolean): void;
    getRangeStartRow(cellRange: CellRange): RowPosition;
    getRangeEndRow(cellRange: CellRange): RowPosition;
    createCellRangeFromCellRangeParams(params: CellRangeParams): CellRange | undefined;
    setCellRanges(cellRanges: CellRange[]): void;
}
export interface ISelectionHandle {
    getGui(): HTMLElement;
    getType(): SelectionHandleType;
    refresh(cellCtrl: CellCtrl): void;
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
    /** The start row of the range */
    startRow?: RowPosition;
    /** The end row of the range */
    endRow?: RowPosition;
    /** The columns in the range */
    columns: Column[];
    /** The start column for the range */
    startColumn: Column;
}
export interface CellRangeParams {
    /** Start row index */
    rowStartIndex: number | null;
    /** Pinned state of start row. Either 'top', 'bottom' or null */
    rowStartPinned?: string | null;
    /** End row index */
    rowEndIndex: number | null;
    /** Pinned state of end row. Either 'top', 'bottom' or null */
    rowEndPinned?: string | null;
    /** Starting column for range */
    columnStart?: string | Column;
    /** End column for range */
    columnEnd?: string | Column;
    /** Specify Columns to include instead of using `columnStart` and `columnEnd` */
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
