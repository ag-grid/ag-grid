import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { CellPosition } from '../entities/cellPositionUtils';
import type { RowNode } from '../entities/rowNode';
import type { RowPosition } from '../entities/rowPositionUtils';
import type { RenderedRowEvent } from '../interfaces/iCallbackParams';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { Column } from '../interfaces/iColumn';
import type { IEventListener } from '../interfaces/iEventEmitter';
import type { IRowNode } from '../interfaces/iRowNode';
import { CellCtrl } from './cell/cellCtrl';
import type { ICellRenderer } from './cellRenderers/iCellRenderer';
import { RowCtrl } from './row/rowCtrl';
export type RowCtrlByRowNodeIdMap = Record<string, RowCtrl>;
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
export declare class RowRenderer extends BeanStub implements NamedBean {
    beanName: "rowRenderer";
    private animationFrameService;
    private paginationService?;
    private pageBoundsService;
    private columnModel;
    private visibleColsService;
    private pinnedRowModel;
    private rowModel;
    private focusService;
    private beans;
    private rowContainerHeightService;
    private ctrlsService;
    private environment;
    wireBeans(beans: BeanCollection): void;
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
    private lastVisibleVPixel;
    private refreshInProgress;
    private printLayout;
    private embedFullWidthRows;
    private stickyRowFeature;
    private dataFirstRenderedFired;
    postConstruct(): void;
    private initialise;
    private initialiseCache;
    private getKeepDetailRowsCount;
    getStickyTopRowCtrls(): RowCtrl[];
    getStickyBottomRowCtrls(): RowCtrl[];
    private updateAllRowCtrls;
    private onCellFocusChanged;
    private registerCellEventListeners;
    private setupRangeSelectionListeners;
    private removeGridColumnListeners;
    private refreshListenersToColumnsForCellComps;
    private onDomLayoutChanged;
    datasourceChanged(): void;
    private onPageLoaded;
    getAllCellsForColumn(column: AgColumn): HTMLElement[];
    refreshFloatingRowComps(): void;
    getTopRowCtrls(): RowCtrl[];
    getCentreRowCtrls(): RowCtrl[];
    getBottomRowCtrls(): RowCtrl[];
    /**
     * Determines which row controllers need to be destroyed and re-created vs which ones can
     * be re-used.
     *
     * This is operation is to pinned/floating rows as `this.recycleRows` is to normal/body rows.
     *
     * All `RowCtrl` instances in `rowCtrls` that don't correspond to `RowNode` instances in `rowNodes` are destroyed.
     * All `RowNode` instances in `rowNodes` that don't correspond to `RowCtrl` instances in `rowCtrls` are created.
     * All instances in `rowCtrls` must be in the same order as their corresponding nodes in `rowNodes`.
     *
     * @param rowCtrls The list of existing row controllers
     * @param rowNodes The canonical list of row nodes that should have associated controllers
     */
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
    addRenderedRowListener(eventName: RenderedRowEvent, rowIndex: number, callback: IEventListener<RenderedRowEvent>): void;
    flashCells(params?: FlashCellsParams): void;
    refreshCells(params?: RefreshCellsParams): void;
    private refreshFullWidth;
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
    destroy(): void;
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
    getLastVisibleVerticalPixel(): number;
    getFirstVirtualRenderedRow(): number;
    getLastVirtualRenderedRow(): number;
    private doNotUnVirtualiseRow;
    private isRowPresent;
    private createRowCon;
    getRenderedNodes(): RowNode<any>[];
    getRowByPosition(rowPosition: RowPosition): RowCtrl | null;
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
