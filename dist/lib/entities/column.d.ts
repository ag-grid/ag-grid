// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnGroupChild } from "./columnGroupChild";
import { OriginalColumnGroupChild } from "./originalColumnGroupChild";
import { ColDef } from "./colDef";
import { AbstractColDef } from "./colDef";
export default class Column implements ColumnGroupChild, OriginalColumnGroupChild {
    static PINNED_RIGHT: string;
    static PINNED_LEFT: string;
    static AGG_SUM: string;
    static AGG_MIN: string;
    static AGG_MAX: string;
    static SORT_ASC: string;
    static SORT_DESC: string;
    private colDef;
    private colId;
    private actualWidth;
    private visible;
    private pinned;
    private left;
    private aggFunc;
    private sort;
    private sortedAt;
    private moving;
    private minWidth;
    private maxWidth;
    static EVENT_MOVING_CHANGED: string;
    static EVENT_LEFT_CHANGED: string;
    static EVENT_WIDTH_CHANGED: string;
    private eventService;
    constructor(colDef: ColDef, actualWidth: any, colId: String, globalMinWidth: number, globalMaxWidth: number);
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    setMoving(moving: boolean): void;
    isMoving(): boolean;
    getSort(): string;
    setSort(sort: string): void;
    getSortedAt(): number;
    setSortedAt(sortedAt: number): void;
    setAggFunc(aggFunc: string): void;
    getAggFunc(): string;
    getLeft(): number;
    setLeft(left: number): void;
    setPinned(pinned: string | boolean): void;
    isPinned(): boolean;
    getPinned(): string;
    setVisible(visible: boolean): void;
    isVisible(): boolean;
    getColDef(): ColDef;
    getColumnGroupShow(): string;
    getColId(): string;
    getDefinition(): AbstractColDef;
    getActualWidth(): number;
    setActualWidth(actualWidth: number): void;
    isGreaterThanMax(width: number): boolean;
    getMinWidth(): number;
    getMaxWidth(): number;
    setMinimum(): void;
}
