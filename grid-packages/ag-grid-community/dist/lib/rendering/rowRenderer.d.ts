import { RowCtrl } from "./row/rowCtrl";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { AgEventListener } from "../events";
import { CellPosition } from "../entities/cellPositionUtils";
import { BeanStub } from "../context/beanStub";
import { ICellRenderer } from "./cellRenderers/iCellRenderer";
import { ICellEditor } from "../interfaces/iCellEditor";
import { RowPosition } from "../entities/rowPositionUtils";
import { CellCtrl } from "./cell/cellCtrl";
import { IRowNode } from "../interfaces/iRowNode";
export interface RowCtrlMap {
    [key: string]: RowCtrl;
}
export interface GetCellsParams<TData = any> {
    /** Optional list of row nodes to restrict operation to */
    rowNodes?: IRowNode<TData>[];
    /** Optional list of columns to restrict operation to */
    columns?: (string | Column)[];
}
export interface RefreshCellsParams<TData = any> extends GetCellsParams<TData> {
    /** Skip change detection, refresh everything. */
    force?: boolean;
    /** Skip cell flashing, if cell flashing is enabled. */
    suppressFlash?: boolean;
}
export interface FlashCellsParams<TData = any> extends GetCellsParams<TData> {
    /** @deprecated v31.1 Use `flashDuration` instead. */
    flashDelay?: number;
    /** @deprecated v31.1 Use `fadeDuration` instead. */
    fadeDelay?: number;
    /** The duration in milliseconds of how long a cell should remain in its "flashed" state. */
    flashDuration?: number;
    /** The duration in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `flashDuration` has completed. */
    fadeDuration?: number;
}
export interface GetCellRendererInstancesParams<TData = any> extends GetCellsParams<TData> {
}
export interface GetCellEditorInstancesParams<TData = any> extends GetCellsParams<TData> {
}
export interface RedrawRowsParams<TData = any> {
    /** Row nodes to redraw */
    rowNodes?: IRowNode<TData>[];
}
export declare class RowRenderer extends BeanStub {
    private animationFrameService;
    private paginationProxy;
    private columnModel;
    private pinnedRowModel;
    private rowModel;
    private focusService;
    private beans;
    private rowContainerHeightService;
    private ctrlsService;
    private gridBodyCtrl;
    private destroyFuncsForColumnListeners;
    private firstRenderedRow;
    private lastRenderedRow;
    private rowCtrlsByRowIndex;
    private zombieRowCtrls;
    private cachedRowCtrls;
    private allRowCtrls;
    private topRowCtrls;
    private bottomRowCtrls;
    private pinningLeft;
    private pinningRight;
    private firstVisibleVPixel;
    private refreshInProgress;
    private printLayout;
    private embedFullWidthRows;
    private stickyRowFeature;
    private dataFirstRenderedFired;
    private postConstruct;
    private initialise;
    private initialiseCache;
    private getKeepDetailRowsCount;
    getStickyTopRowCtrls(): RowCtrl[];
    private updateAllRowCtrls;
    private onCellFocusChanged;
    private registerCellEventListeners;
    private setupRangeSelectionListeners;
    private removeGridColumnListeners;
    private refreshListenersToColumnsForCellComps;
    private onDomLayoutChanged;
    datasourceChanged(): void;
    private onPageLoaded;
    getAllCellsForColumn(column: Column): HTMLElement[];
    refreshFloatingRowComps(): void;
    getTopRowCtrls(): RowCtrl[];
    getCentreRowCtrls(): RowCtrl[];
    getBottomRowCtrls(): RowCtrl[];
    private refreshFloatingRows;
    private onPinnedRowDataChanged;
    redrawRow(rowNode: RowNode, suppressEvent?: boolean): void;
    redrawRows(rowNodes?: IRowNode[]): void;
    private getCellToRestoreFocusToAfterRefresh;
    private redrawAfterModelUpdate;
    private scrollToTopIfNewData;
    private updateContainerHeights;
    private getLockOnRefresh;
    private releaseLockOnRefresh;
    isRefreshInProgress(): boolean;
    private restoreFocusedCell;
    stopEditing(cancel?: boolean): void;
    getAllCellCtrls(): CellCtrl[];
    private getAllRowCtrls;
    addRenderedRowListener(eventName: string, rowIndex: number, callback: AgEventListener): void;
    flashCells(params?: FlashCellsParams): void;
    refreshCells(params?: RefreshCellsParams): void;
    getCellRendererInstances(params: GetCellRendererInstancesParams): ICellRenderer[];
    getCellEditorInstances(params: GetCellRendererInstancesParams): ICellEditor[];
    getEditingCells(): CellPosition[];
    private mapRowNodes;
    private isRowInMap;
    /**
     * @param rowNodes if provided, returns the RowCtrls for the provided rowNodes. otherwise returns all RowCtrls.
     */
    getRowCtrls(rowNodes?: IRowNode[] | null): RowCtrl[];
    private getCellCtrls;
    protected destroy(): void;
    private removeAllRowComps;
    private getRowsToRecycle;
    private removeRowCtrls;
    private onBodyScroll;
    redraw(params?: {
        afterScroll?: boolean;
    }): void;
    private removeRowCompsNotToDraw;
    private calculateIndexesToDraw;
    private recycleRows;
    private dispatchDisplayedRowsChanged;
    private onDisplayedColumnsChanged;
    private redrawFullWidthEmbeddedRows;
    getFullWidthRowCtrls(rowNodes?: IRowNode[]): RowCtrl[];
    private createOrUpdateRowCtrl;
    private destroyRowCtrls;
    private getRowBuffer;
    private getRowBufferInPixels;
    private workOutFirstAndLastRowsToRender;
    /**
     * This event will only be fired once, and is queued until after the browser next renders.
     * This allows us to fire an event during the start of the render cycle, when we first see data being rendered
     * but not execute the event until all of the data has finished being rendered to the dom.
     */
    dispatchFirstDataRenderedEvent(): void;
    private ensureAllRowsInRangeHaveHeightsCalculated;
    getFirstVisibleVerticalPixel(): number;
    getFirstVirtualRenderedRow(): number;
    getLastVirtualRenderedRow(): number;
    private doNotUnVirtualiseRow;
    private createRowCon;
    getRenderedNodes(): RowNode<any>[];
    getRowByPosition(rowPosition: RowPosition): RowCtrl | null;
    getRowNode(gridRow: RowPosition): RowNode | undefined;
    isRangeInRenderedViewport(startIndex: number, endIndex: number): boolean;
}
export interface RefreshViewParams {
    recycleRows?: boolean;
    animate?: boolean;
    suppressKeepFocus?: boolean;
    onlyBody?: boolean;
    newData?: boolean;
    newPage?: boolean;
    domLayoutChanged?: boolean;
}
