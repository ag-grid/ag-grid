import { Column } from "../entities/column";
import { CellPosition } from "../entities/cellPositionUtils";
import { RowPosition } from "../entities/rowPositionUtils";
import { CellCtrl } from "../rendering/cell/cellCtrl";
import { RowPinnedType } from "../interfaces/iRowNode";
export interface IRangeService {
    isEmpty(): boolean;
    removeAllCellRanges(silent?: boolean): void;
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
    intersectLastRange(fromMouseClick?: boolean): void;
    setCellRange(params: CellRangeParams): void;
    addCellRange(params: CellRangeParams): void;
    extendLatestRangeInDirection(event: KeyboardEvent): CellPosition | undefined;
    extendLatestRangeToCell(cell: CellPosition): void;
    updateRangeEnd(cellRange: CellRange, cellPosition: CellPosition, silent?: boolean): void;
    getRangeStartRow(cellRange: PartialCellRange): RowPosition;
    getRangeEndRow(cellRange: PartialCellRange): RowPosition;
    createCellRangeFromCellRangeParams(params: CellRangeParams): CellRange | undefined;
    createPartialCellRangeFromRangeParams(params: CellRangeParams, allowEmptyColumns: boolean): PartialCellRange | undefined;
    setCellRanges(cellRanges: CellRange[]): void;
    clearCellRangeCellValues(params: ClearCellRangeParams): void;
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
export type PartialCellRange = Omit<CellRange, 'startColumn'> & Partial<Pick<CellRange, 'startColumn'>>;
export interface CellRangeParams {
    /** Start row index */
    rowStartIndex: number | null;
    /** Pinned state of start row. Either 'top', 'bottom' or null */
    rowStartPinned?: RowPinnedType;
    /** End row index */
    rowEndIndex: number | null;
    /** Pinned state of end row. Either 'top', 'bottom' or null */
    rowEndPinned?: RowPinnedType;
    /** Starting column for range */
    columnStart?: string | Column;
    /** End column for range */
    columnEnd?: string | Column;
    /** Specify Columns to include instead of using `columnStart` and `columnEnd` */
    columns?: (string | Column)[];
}
export interface ClearCellRangeParams {
    cellRanges?: CellRange[];
    /** Source passed to `cellValueChanged` event */
    cellEventSource?: string;
    /** `true` to dispatch `rangeDeleteStart` and `rangeDeleteEnd` events */
    dispatchWrapperEvents?: boolean;
    /** Source passed to `rangeDeleteStart` and `rangeDeleteEnd` events */
    wrapperEventSource?: 'deleteKey';
}
