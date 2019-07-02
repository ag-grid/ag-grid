import { CellComp } from "./cellComp";
import { CellChangedEvent, DataChangedEvent, RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import {
    Events,
    RowClickedEvent,
    RowDoubleClickedEvent,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowEvent,
    RowValueChangedEvent,
    VirtualRowRemovedEvent
} from "../events";

import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { RowContainerComponent } from "./rowContainerComponent";
import { Component } from "../widgets/component";

import { Beans } from "./beans";
import { ProcessRowParams } from "../entities/gridOptions";
import { _ } from "../utils";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";

interface CellTemplate {
    template: string;
    cellComps: CellComp[];
}

export class RowComp extends Component {

    public static DOM_DATA_KEY_RENDERED_ROW = 'renderedRow';

    private static FULL_WIDTH_CELL_RENDERER = 'fullWidthCellRenderer';

    private static GROUP_ROW_RENDERER = 'groupRowRenderer';
    private static GROUP_ROW_RENDERER_COMP_NAME = 'agGroupRowRenderer';

    private static LOADING_CELL_RENDERER = 'loadingCellRenderer';
    private static LOADING_CELL_RENDERER_COMP_NAME = 'agLoadingCellRenderer';

    private static DETAIL_CELL_RENDERER = 'detailCellRenderer';
    private static DETAIL_CELL_RENDERER_COMP_NAME = 'agDetailCellRenderer';

    private readonly rowNode: RowNode;

    private readonly beans: Beans;

    private ePinnedLeftRow: HTMLElement;
    private ePinnedRightRow: HTMLElement;
    private eBodyRow: HTMLElement;
    private eAllRowContainers: HTMLElement[] = [];

    private eFullWidthRow: HTMLElement;
    private eFullWidthRowBody: HTMLElement;
    private eFullWidthRowLeft: HTMLElement;
    private eFullWidthRowRight: HTMLElement;

    private readonly bodyContainerComp: RowContainerComponent;
    private readonly fullWidthContainerComp: RowContainerComponent;
    private readonly pinnedLeftContainerComp: RowContainerComponent;
    private readonly pinnedRightContainerComp: RowContainerComponent;

    private fullWidthRowComponent: ICellRendererComp;
    private fullWidthRowComponentBody: ICellRendererComp;
    private fullWidthRowComponentLeft: ICellRendererComp;
    private fullWidthRowComponentRight: ICellRendererComp;

    private firstRowOnPage: boolean;
    private lastRowOnPage: boolean;

    private active = true;

    private fullWidthRow: boolean;

    private editingRow: boolean;
    private rowFocused: boolean;

    private rowContainerReadyCount = 0;
    private refreshNeeded = false;
    private columnRefreshPending = false;

    private cellComps: {[key: string]: CellComp} = {};

    // for animations, there are bits we want done in the next VM turn, to all DOM to update first.
    // instead of each row doing a setTimeout(func,0), we put the functions here and the rowRenderer
    // executes them all in one timeout
    private createSecondPassFuncs: Function[] = [];

    // these get called before the row is destroyed - they set up the DOM for the remove animation (ie they
    // set the DOM up for the animation), then the delayedDestroyFunctions get called when the animation is
    // complete (ie removes from the dom).
    private removeFirstPassFuncs: Function[] = [];

    // for animations, these functions get called 400ms after the row is cleared, called by the rowRenderer
    // so each row isn't setting up it's own timeout
    private removeSecondPassFuncs: Function[] = [];

    private fadeRowIn: boolean;
    private slideRowIn: boolean;
    private readonly useAnimationFrameForCreate: boolean;

    private rowIsEven: boolean;

    private paginationPage: number;

    private parentScope: any;
    private scope: any;

    private initialised = false;

    private readonly printLayout: boolean;
    private readonly embedFullWidth: boolean;

    constructor(parentScope: any,
                bodyContainerComp: RowContainerComponent,
                pinnedLeftContainerComp: RowContainerComponent,
                pinnedRightContainerComp: RowContainerComponent,
                fullWidthContainerComp: RowContainerComponent,
                rowNode: RowNode,
                beans: Beans,
                animateIn: boolean,
                useAnimationFrameForCreate: boolean,
                printLayout: boolean,
                embedFullWidth: boolean) {
        super();
        this.parentScope = parentScope;
        this.beans = beans;
        this.bodyContainerComp = bodyContainerComp;
        this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        this.pinnedRightContainerComp = pinnedRightContainerComp;
        this.fullWidthContainerComp = fullWidthContainerComp;
        this.rowNode = rowNode;
        this.rowIsEven = this.rowNode.rowIndex % 2 === 0;
        this.paginationPage = this.beans.paginationProxy.getCurrentPage();
        this.useAnimationFrameForCreate = useAnimationFrameForCreate;
        this.printLayout = printLayout;
        this.embedFullWidth = embedFullWidth;

        this.setAnimateFlags(animateIn);
    }

    public init(): void {
        this.rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);

        this.scope = this.createChildScopeOrNull(this.rowNode.data);

        this.setupRowContainers();

        this.addListeners();

        if (this.slideRowIn) {
            this.createSecondPassFuncs.push(() => {
                this.onTopChanged();
            });
        }
        if (this.fadeRowIn) {
            this.createSecondPassFuncs.push(() => {
                this.eAllRowContainers.forEach(eRow => _.removeCssClass(eRow, 'ag-opacity-zero'));
            });
        }
    }

    private createTemplate(contents: string, extraCssClass: string = null): string {
        const templateParts: string[] = [];
        const rowHeight = this.rowNode.rowHeight;
        const rowClasses = this.getInitialRowClasses(extraCssClass).join(' ');
        const rowIdSanitised = _.escape(this.rowNode.id);
        const userRowStyles = this.preProcessStylesFromGridOptions();
        const businessKey = this.getRowBusinessKey();
        const businessKeySanitised = _.escape(businessKey);
        const rowTopStyle = this.getInitialRowTopStyle();

        templateParts.push(`<div`);
        templateParts.push(` role="row"`);
        templateParts.push(` row-index="${this.rowNode.getRowIndexString()}"`);
        templateParts.push(rowIdSanitised ? ` row-id="${rowIdSanitised}"` : ``);
        templateParts.push(businessKey ? ` row-business-key="${businessKeySanitised}"` : ``);
        templateParts.push(` comp-id="${this.getCompId()}"`);
        templateParts.push(` class="${rowClasses}"`);
        templateParts.push(` style="height: ${rowHeight}px; ${rowTopStyle} ${userRowStyles}">`);

        // add in the template for the cells
        templateParts.push(contents);
        templateParts.push(`</div>`);

        return templateParts.join('');
    }

    public getCellForCol(column: Column): HTMLElement {
        const cellComp = this.cellComps[column.getColId()];

        return cellComp ? cellComp.getGui() : null;
    }

    public afterFlush(): void {
        if (this.initialised) { return; }

        this.initialised = true;
        this.executeProcessRowPostCreateFunc();
    }

    private executeProcessRowPostCreateFunc(): void {
        const func = this.beans.gridOptionsWrapper.getProcessRowPostCreateFunc();
        if (!func) { return; }

        const params: ProcessRowParams = {
            eRow: this.eBodyRow,
            ePinnedLeftRow: this.ePinnedLeftRow,
            ePinnedRightRow: this.ePinnedRightRow,
            node: this.rowNode,
            api: this.beans.gridOptionsWrapper.getApi(),
            rowIndex: this.rowNode.rowIndex,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };
        func(params);
    }

    private getInitialRowTopStyle() {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) { return ''; }

        // if sliding in, we take the old row top. otherwise we just set the current row top.
        const pixels = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop) : this.rowNode.rowTop;
        const afterPaginationPixels = this.applyPaginationOffset(pixels);
        const afterScalingPixels = this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
        const isSuppressRowTransform = this.beans.gridOptionsWrapper.isSuppressRowTransform();

        return isSuppressRowTransform ? `top: ${afterScalingPixels}px; ` : `transform: translateY(${afterScalingPixels}px);`;
    }

    private getRowBusinessKey(): string {
        const businessKeyForNodeFunc = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc();
        if (typeof businessKeyForNodeFunc !== 'function') { return ; }

        return businessKeyForNodeFunc(this.rowNode);
    }

    private areAllContainersReady(): boolean {
        return this.rowContainerReadyCount === 3;
    }

    private lazyCreateCells(cols: Column[], eRow: HTMLElement): void {
        if (!this.active) { return; }

        const cellTemplatesAndComps = this.createCells(cols);
        eRow.innerHTML = cellTemplatesAndComps.template;
        this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);

        this.rowContainerReadyCount++;

        if (this.areAllContainersReady() && this.refreshNeeded) {
            this.refreshCells();
        }
    }

    private createRowContainer(rowContainerComp: RowContainerComponent, cols: Column[],
                               callback: (eRow: HTMLElement) => void): void {

        const useAnimationsFrameForCreate = this.useAnimationFrameForCreate;
        const cellTemplatesAndComps: CellTemplate = useAnimationsFrameForCreate ? {cellComps: [], template: ''} : this.createCells(cols);
        const rowTemplate = this.createTemplate(cellTemplatesAndComps.template);

        // the RowRenderer is probably inserting many rows. rather than inserting each template one
        // at a time, the grid inserts all rows together - so the callback here is called by the
        // rowRenderer when all RowComps are created, then all the HTML is inserted in one go,
        // and then all the callbacks are called. this is NOT done in an animation frame.
        rowContainerComp.appendRowTemplate(rowTemplate, () => {
            const eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());
            this.afterRowAttached(rowContainerComp, eRow);
            callback(eRow);

            if (useAnimationsFrameForCreate) {
                this.beans.taskQueue.addP1Task(this.lazyCreateCells.bind(this, cols, eRow), this.rowNode.rowIndex);
            } else {
                this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
                this.rowContainerReadyCount = 3;
            }
        });
    }

    private createChildScopeOrNull(data: any) {
        const isAngularCompileRows = this.beans.gridOptionsWrapper.isAngularCompileRows();

        if (!isAngularCompileRows) {
            return null;
        }

        const newChildScope = this.parentScope.$new();
        newChildScope.data = {...data };
        newChildScope.rowNode = this.rowNode;
        newChildScope.context = this.beans.gridOptionsWrapper.getContext();

        this.addDestroyFunc(() => {
            newChildScope.$destroy();
            newChildScope.data = null;
            newChildScope.rowNode = null;
            newChildScope.context = null;
        });

        return newChildScope;
    }

    private setupRowContainers(): void {
        const isFullWidthCellFunc = this.beans.gridOptionsWrapper.getIsFullWidthCellFunc();
        const isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        const isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;
        const pivotMode = this.beans.columnController.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        const isGroupRow = this.rowNode.group && !this.rowNode.footer;
        const isFullWidthGroup =  isGroupRow && this.beans.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);

        if (this.rowNode.stub) {
            this.createFullWidthRows(RowComp.LOADING_CELL_RENDERER, RowComp.LOADING_CELL_RENDERER_COMP_NAME);
        } else if (isDetailCell) {
            this.createFullWidthRows(RowComp.DETAIL_CELL_RENDERER, RowComp.DETAIL_CELL_RENDERER_COMP_NAME);
        } else if (isFullWidthCell) {
            this.createFullWidthRows(RowComp.FULL_WIDTH_CELL_RENDERER, null);
        } else if (isFullWidthGroup) {
            this.createFullWidthRows(RowComp.GROUP_ROW_RENDERER, RowComp.GROUP_ROW_RENDERER_COMP_NAME);
        } else {
            this.setupNormalRowContainers();
        }
    }

    private setupNormalRowContainers(): void {
        let centerCols: Column[];
        let leftCols: Column[];
        let rightCols: Column[];

        if (this.printLayout) {
            centerCols = this.beans.columnController.getAllDisplayedColumns();
            leftCols = [];
            rightCols = [];
        } else {
            centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
            leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }

        this.createRowContainer(this.bodyContainerComp, centerCols, eRow => this.eBodyRow = eRow);
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, eRow => this.ePinnedRightRow = eRow);
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, eRow => this.ePinnedLeftRow = eRow);
    }

    private createFullWidthRows(type: string, name: string): void {
        this.fullWidthRow = true;

        if (this.embedFullWidth) {
            this.createFullWidthRowContainer(this.bodyContainerComp, null,
                null, type, name,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowBody = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentBody = cellRenderer;
                });

            // printLayout doesn't put components into the pinned sections
            if (!this.printLayout) {
                this.createFullWidthRowContainer(this.pinnedLeftContainerComp, Column.PINNED_LEFT,
                    'ag-cell-last-left-pinned', type, name,
                    (eRow: HTMLElement) => {
                        this.eFullWidthRowLeft = eRow;
                    },
                    (cellRenderer: ICellRendererComp) => {
                        this.fullWidthRowComponentLeft = cellRenderer;
                    });
                this.createFullWidthRowContainer(this.pinnedRightContainerComp, Column.PINNED_RIGHT,
                    'ag-cell-first-right-pinned', type, name,
                    (eRow: HTMLElement) => {
                        this.eFullWidthRowRight = eRow;
                    },
                    (cellRenderer: ICellRendererComp) => {
                        this.fullWidthRowComponentRight = cellRenderer;
                    });
            }
        } else {
            // otherwise we add to the fullWidth container as normal
            // let previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.createFullWidthRowContainer(this.fullWidthContainerComp, null,
                null, type, name,
                (eRow: HTMLElement) => {
                    this.eFullWidthRow = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponent = cellRenderer;
                }
            );
        }
    }

    private setAnimateFlags(animateIn: boolean): void {
        if (animateIn) {
            const oldRowTopExists = _.exists(this.rowNode.oldRowTop);
            // if the row had a previous position, we slide it in (animate row top)
            this.slideRowIn = oldRowTopExists;
            // if the row had no previous position, we fade it in (animate
            this.fadeRowIn = !oldRowTopExists;
        } else {
            this.slideRowIn = false;
            this.fadeRowIn = false;
        }
    }

    public isEditing(): boolean {
        return this.editingRow;
    }

    public stopRowEditing(cancel: boolean): void {
        this.stopEditing(cancel);
    }

    public isFullWidth(): boolean {
        return this.fullWidthRow;
    }

    public refreshFullWidth(): boolean {

        // returns 'true' if refresh succeeded
        const tryRefresh = (eRow: HTMLElement, eCellComp: ICellRendererComp, pinned: string): boolean => {
            if (!eRow || !eCellComp) {
                // no refresh needed
                return true;
            }

            if (!eCellComp.refresh) {
                // no refresh method present, so can't refresh, hard refresh needed
                return false;
            }

            const params = this.createFullWidthParams(eRow, pinned);
            const refreshSucceeded = eCellComp.refresh(params);
            return refreshSucceeded;
        };

        const normalSuccess = tryRefresh(this.eFullWidthRow, this.fullWidthRowComponent, null);
        const bodySuccess = tryRefresh(this.eFullWidthRowBody, this.fullWidthRowComponentBody, null);
        const leftSuccess = tryRefresh(this.eFullWidthRowLeft, this.fullWidthRowComponentLeft, Column.PINNED_LEFT);
        const rightSuccess = tryRefresh(this.eFullWidthRowRight, this.fullWidthRowComponentRight, Column.PINNED_RIGHT);

        const allFullWidthRowsRefreshed = normalSuccess && bodySuccess && leftSuccess && rightSuccess;

        return allFullWidthRowsRefreshed;
    }

    private addListeners(): void {
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_EXPANDED_CHANGED, this.onExpandedChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.onRowNodeCellChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DRAGGING_CHANGED, this.onRowNodeDraggingChanged.bind(this));

        const eventService = this.beans.eventService;
        this.addDestroyableEventListener(eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));

        this.addListenersForCellComps();
    }

    private addListenersForCellComps(): void {

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, () => {
            this.forEachCellComp(cellComp => cellComp.onRowIndexChanged());
        });
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, event => {
            this.forEachCellComp(cellComp => cellComp.onCellChanged(event));
        });

    }

    // when grid columns change, then all cells should be cleaned out,
    // as the new columns could have same id as the previous columns and may conflict
    private onGridColumnsChanged(): void {
        this.removeRenderedCells(Object.keys(this.cellComps));
    }

    private onRowNodeDataChanged(event: DataChangedEvent): void {
        // if this is an update, we want to refresh, as this will allow the user to put in a transition
        // into the cellRenderer refresh method. otherwise this might be completely new data, in which case
        // we will want to completely replace the cells
        this.forEachCellComp(cellComp =>
            cellComp.refreshCell({
                suppressFlash: !event.update,
                newData: !event.update
            })
        );

        // check for selected also, as this could be after lazy loading of the row data, in which case
        // the id might of just gotten set inside the row and the row selected state may of changed
        // as a result. this is what happens when selected rows are loaded in virtual pagination.
        // - niall note - since moving to the stub component, this may no longer be true, as replacing
        // the stub component now replaces the entire row
        this.onRowSelected();

        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    }

    private onRowNodeCellChanged(event: CellChangedEvent): void {
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    }

    private postProcessCss(): void {
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    }

    private onRowNodeDraggingChanged(): void {
        this.postProcessRowDragging();
    }

    private postProcessRowDragging(): void {
        const dragging = this.rowNode.dragging;
        this.eAllRowContainers.forEach(row => _.addOrRemoveCssClass(row, 'ag-row-dragging', dragging));
    }

    private onExpandedChanged(): void {
        const rowNode = this.rowNode;
        this.eAllRowContainers.forEach(row => _.addOrRemoveCssClass(row, 'ag-row-group-expanded', rowNode.expanded));
        this.eAllRowContainers.forEach(row => _.addOrRemoveCssClass(row, 'ag-row-group-contracted', !rowNode.expanded));
    }

    private onDisplayedColumnsChanged(): void {
        if (this.fullWidthRow) { return; }

        this.refreshCells();
    }

    private destroyFullWidthComponents(): void {
        if (this.fullWidthRowComponent) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponentBody);
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentLeft) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, Column.PINNED_LEFT, this.fullWidthRowComponentLeft);
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, Column.PINNED_RIGHT, this.fullWidthRowComponentRight);
            this.fullWidthRowComponent = null;
        }
    }

    private getContainerForCell(pinnedType: string): HTMLElement {
        switch (pinnedType) {
            case Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case Column.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
        }
    }

    private onVirtualColumnsChanged(): void {
        if (this.fullWidthRow) { return; }

        this.refreshCells();
    }

    private onColumnResized(): void {
        if (this.fullWidthRow) { return; }

        this.refreshCells();
    }

    private refreshCells() {
        if (!this.areAllContainersReady()) {
            this.refreshNeeded = true;
            return;
        }

        const suppressAnimationFrame = this.beans.gridOptionsWrapper.isSuppressAnimationFrame();
        const skipAnimationFrame = suppressAnimationFrame || this.printLayout;

        if (skipAnimationFrame) {
            this.refreshCellsInAnimationFrame();
        } else {
            if (this.columnRefreshPending) { return; }
            this.beans.taskQueue.addP1Task(this.refreshCellsInAnimationFrame.bind(this), this.rowNode.rowIndex);
        }
    }

    private refreshCellsInAnimationFrame() {
        if (!this.active) { return; }
        this.columnRefreshPending = false;

        let centerCols: Column[];
        let leftCols: Column[];
        let rightCols: Column[];

        if (this.printLayout) {
            centerCols = this.beans.columnController.getAllDisplayedColumns();
            leftCols = [];
            rightCols = [];
        } else {
            centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
            leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }

        this.insertCellsIntoContainer(this.eBodyRow, centerCols);
        this.insertCellsIntoContainer(this.ePinnedLeftRow, leftCols);
        this.insertCellsIntoContainer(this.ePinnedRightRow, rightCols);

        const colIdsToRemove = Object.keys(this.cellComps);
        centerCols.forEach(col => _.removeFromArray(colIdsToRemove, col.getId()));
        leftCols.forEach(col => _.removeFromArray(colIdsToRemove, col.getId()));
        rightCols.forEach(col => _.removeFromArray(colIdsToRemove, col.getId()));

        // we never remove editing cells, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally.
        const eligibleToBeRemoved = _.filter(colIdsToRemove, this.isCellEligibleToBeRemoved.bind(this));

        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(eligibleToBeRemoved);
    }

    private removeRenderedCells(colIds: string[]): void {
        colIds.forEach((key: string) => {
            const cellComp = this.cellComps[key];
            // could be old reference, ie removed cell
            if (_.missing(cellComp)) { return; }

            cellComp.detach();
            cellComp.destroy();
            this.cellComps[key] = null;
        });
    }

    private isCellEligibleToBeRemoved(indexStr: string): boolean {
        const displayedColumns = this.beans.columnController.getAllDisplayedColumns();

        const REMOVE_CELL = true;
        const KEEP_CELL = false;
        const renderedCell = this.cellComps[indexStr];

        if (!renderedCell) { return REMOVE_CELL; }

        // always remove the cell if it's in the wrong pinned location
        if (this.isCellInWrongRow(renderedCell)) { return REMOVE_CELL; }

        // we want to try and keep editing and focused cells
        const editing = renderedCell.isEditing();
        const focused = this.beans.focusedCellController.isCellFocused(renderedCell.getCellPosition());

        const mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            const column = renderedCell.getColumn();
            const cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;

    }

    private ensureCellInCorrectContainer(cellComp: CellComp): void {
        // for print layout, we always put cells into centre, otherwise we put in correct pinned section
        if (this.printLayout) { return; }

        const element = cellComp.getGui();
        const column = cellComp.getColumn();
        const pinnedType = column.getPinned();
        const eContainer = this.getContainerForCell(pinnedType);

        // if in wrong container, remove it
        const eOldContainer = cellComp.getParentRow();
        const inWrongRow = eOldContainer !== eContainer;
        if (inWrongRow) {
            // take out from old row
            if (eOldContainer) {
                eOldContainer.removeChild(element);
            }

            eContainer.appendChild(element);
            cellComp.setParentRow(eContainer);
        }
    }

    private isCellInWrongRow(cellComp: CellComp): boolean {
        const column = cellComp.getColumn();
        const rowWeWant = this.getContainerForCell(column.getPinned());

        // if in wrong container, remove it
        const oldRow = cellComp.getParentRow();
        return oldRow !== rowWeWant;
    }

    private insertCellsIntoContainer(eRow: HTMLElement, cols: Column[]): void {
        if (!eRow) { return; }

        const cellTemplates: string[] = [];
        const newCellComps: CellComp[] = [];

        cols.forEach(col => {
            const colId = col.getId();
            const existingCell = this.cellComps[colId];

            if (existingCell) {
                this.ensureCellInCorrectContainer(existingCell);
            } else {
                this.createNewCell(col, eRow, cellTemplates, newCellComps);
            }

        });

        if (cellTemplates.length > 0) {
            _.appendHtml(eRow, cellTemplates.join(''));
            this.callAfterRowAttachedOnCells(newCellComps, eRow);
        }
    }

    private addDomData(eRowContainer: Element): void {
        const gow = this.beans.gridOptionsWrapper;
        gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc(() => {
            gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, null); }
        );
    }

    private createNewCell(col: Column, eContainer: HTMLElement, cellTemplates: string[], newCellComps: CellComp[]): void {
        const newCellComp = new CellComp(this.scope, this.beans, col, this.rowNode, this, false, this.printLayout);
        const cellTemplate = newCellComp.getCreateTemplate();
        cellTemplates.push(cellTemplate);
        newCellComps.push(newCellComp);
        this.cellComps[col.getId()] = newCellComp;
        newCellComp.setParentRow(eContainer);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick': this.onRowDblClick(mouseEvent); break;
            case 'click': this.onRowClick(mouseEvent); break;
        }
    }

    private createRowEvent(type: string, domEvent?: Event): RowEvent {
        return {
            type: type,
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex,
            rowPinned: this.rowNode.rowPinned,
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            event: domEvent
        };
    }

    private createRowEventWithSource(type: string, domEvent: Event): RowEvent {
        const event = this.createRowEvent(type, domEvent);
        // when first developing this, we included the rowComp in the event.
        // this seems very weird. so when introducing the event types, i left the 'source'
        // out of the type, and just include the source in the two places where this event
        // was fired (rowClicked and rowDoubleClicked). it doesn't make sense for any
        // users to be using this, as the rowComp isn't an object we expose, so would be
        // very surprising if a user was using it.
        (event as any).source = this;
        return event;
    }

    private onRowDblClick(mouseEvent: MouseEvent): void {
        if (_.isStopPropagationForAgGrid(mouseEvent)) { return; }

        const agEvent: RowDoubleClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);
    }

    public onRowClick(mouseEvent: MouseEvent) {
        const stop = _.isStopPropagationForAgGrid(mouseEvent);
        if (stop) { return; }

        const agEvent: RowClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);

        // ctrlKey for windows, metaKey for Apple
        const multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        const shiftKeyPressed = mouseEvent.shiftKey;

        if (
            // we do not allow selecting groups by clicking (as the click here expands the group), or if it's a detail row,
            // so return if it's a group row
            this.rowNode.group ||
            // this is needed so we don't unselect other rows when we click this row, eg if this row is not selectable,
            // and we click it, the selection should not change (ie any currently selected row should stay selected)
            !this.rowNode.selectable ||
            // we also don't allow selection of pinned rows
            this.rowNode.rowPinned ||
            // if no selection method enabled, do nothing
            !this.beans.gridOptionsWrapper.isRowSelection() ||
            // if click selection suppressed, do nothing
            this.beans.gridOptionsWrapper.isSuppressRowClickSelection()
        ) {
            return;
        }

        const multiSelectOnClick = this.beans.gridOptionsWrapper.isRowMultiSelectWithClick();
        const rowDeselectionWithCtrl = this.beans.gridOptionsWrapper.isRowDeselection();

        if (this.rowNode.isSelected()) {
            if (multiSelectOnClick) {
                this.rowNode.setSelectedParams({newValue: false});
            } else if (multiSelectKeyPressed) {
                if (rowDeselectionWithCtrl) {
                    this.rowNode.setSelectedParams({newValue: false});
                }
            } else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({newValue: true, clearSelection: true});
            }
        } else {
            const clearSelection = multiSelectOnClick ? false : !multiSelectKeyPressed;
            this.rowNode.setSelectedParams({newValue: true, clearSelection: clearSelection, rangeSelect: shiftKeyPressed});
        }
    }

    private createFullWidthRowContainer(rowContainerComp: RowContainerComponent, pinned: string,
                                        extraCssClass: string, cellRendererType: string, cellRendererName: string,
                                        eRowCallback: (eRow: HTMLElement) => void,
                                        cellRendererCallback: (comp: ICellRendererComp) => void): void {

        const rowTemplate = this.createTemplate('', extraCssClass);
        rowContainerComp.appendRowTemplate(rowTemplate, () => {

            const eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());
            const params = this.createFullWidthParams(eRow, pinned);

            const callback = (cellRenderer: ICellRendererComp) => {
                if (this.isAlive()) {
                    const gui = cellRenderer.getGui();
                    eRow.appendChild(gui);
                    cellRendererCallback(cellRenderer);
                } else {
                    if (cellRenderer.destroy) {
                        cellRenderer.destroy();
                    }
                }
            };

            // if doing master detail, it's possible we have a cached row comp from last time detail was displayed
            const cachedRowComp = this.beans.detailRowCompCache.get(this.rowNode, pinned);
            if (cachedRowComp) {
                callback(cachedRowComp);
            } else {
                const res = this.beans.userComponentFactory.newFullWidthCellRenderer(params, cellRendererType, cellRendererName);
                if (!res) {
                    console.error('ag-Grid: fullWidthCellRenderer not defined');
                    return;
                }
                res.then(callback);
            }

            this.afterRowAttached(rowContainerComp, eRow);
            eRowCallback(eRow);

            this.angular1Compile(eRow);
        });
    }

    private angular1Compile(element: Element): void {
        if (!this.scope) { return ; }

        this.beans.$compile(element)(this.scope);
    }

    private createFullWidthParams(eRow: HTMLElement, pinned: string): any {
        const params = {
            fullWidth: true,
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
            $scope: this.scope ? this.scope : this.parentScope,
            $compile: this.beans.$compile,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            // these need to be taken out, as part of 'afterAttached' now
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this)
        };

        return params;
    }

    private getInitialRowClasses(extraCssClass: string): string[] {
        const classes: string[] = [];
        const isTreeData = this.beans.gridOptionsWrapper.isTreeData();
        const rowNode = this.rowNode;

        if (_.exists(extraCssClass)) {
            classes.push(extraCssClass);
        }

        classes.push('ag-row');
        classes.push(this.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');

        if (this.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }

        classes.push(this.rowIsEven ? 'ag-row-even' : 'ag-row-odd');

        if (rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + rowNode.level);

            if (rowNode.footer) {
                classes.push('ag-row-footer');
            }
        } else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            classes.push('ag-row-level-' + (rowNode.parent ? (rowNode.parent.level + 1) : '0'));
        }

        if (rowNode.stub) {
            classes.push('ag-row-stub');
        }

        if (this.fullWidthRow) {
            classes.push('ag-full-width-row');
        }

        const addExpandedClass = isTreeData ?
            // if doing tree data, we add the expanded classes if any children, as any node can be a parent
            rowNode.allChildrenCount :
            // if normal row grouping, we add expanded classes to groups only
            rowNode.group && !rowNode.footer;
        if (addExpandedClass) {
            classes.push(rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }

        if (rowNode.dragging) {
            classes.push('ag-row-dragging');
        }

        _.pushAll(classes, this.processClassesFromGridOptions());
        _.pushAll(classes, this.preProcessRowClassRules());

        // we use absolute position unless we are doing print layout
        classes.push(this.printLayout ? 'ag-row-position-relative' : 'ag-row-position-absolute');

        this.firstRowOnPage = this.isFirstRowOnPage();
        this.lastRowOnPage = this.isLastRowOnPage();

        if (this.firstRowOnPage) {
            classes.push('ag-row-first');
        }

        if (this.lastRowOnPage) {
            classes.push('ag-row-last');
        }

        return classes;
    }

    private isFirstRowOnPage(): boolean {
        return this.rowNode.rowIndex === this.beans.paginationProxy.getPageFirstRow();
    }

    private isLastRowOnPage(): boolean {
        return this.rowNode.rowIndex === this.beans.paginationProxy.getPageLastRow();
    }

    private onModelUpdated(): void {
        const newFirst = this.isFirstRowOnPage();
        const newLast = this.isLastRowOnPage();

        if (this.firstRowOnPage !== newFirst) {
            this.firstRowOnPage = newFirst;
            this.eAllRowContainers.forEach((row) => _.addOrRemoveCssClass(row, 'ag-row-first', newFirst));
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.eAllRowContainers.forEach((row) => _.addOrRemoveCssClass(row, 'ag-row-last', newLast));
        }
    }

    private preProcessRowClassRules(): string[] {
        const res: string[] = [];

        this.processRowClassRules(
            (className: string) => {
                res.push(className);
            },
            (className: string) => {
                // not catered for, if creating, no need
                // to remove class as it was never there
            }
        );

        return res;
    }

    private processRowClassRules(onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void {
        this.beans.stylingService.processClassRules(
            this.beans.gridOptionsWrapper.rowClassRules(),
            {
                value: undefined,
                colDef:undefined,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                $scope: this.scope,
                context: this.beans.gridOptionsWrapper.getContext()
            }, onApplicableClass, onNotApplicableClass);
    }

    public stopEditing(cancel = false): void {
        this.forEachCellComp(renderedCell => {
            renderedCell.stopEditing(cancel);
        });

        if (!this.editingRow) { return; }

        if (!cancel) {
            const event: RowValueChangedEvent = this.createRowEvent(Events.EVENT_ROW_VALUE_CHANGED);
            this.beans.eventService.dispatchEvent(event);
        }
        this.setEditingRow(false);
    }

    private setEditingRow(value: boolean): void {
        this.editingRow = value;
        this.eAllRowContainers.forEach(row => _.addOrRemoveCssClass(row, 'ag-row-editing', value));

        const event: RowEvent = value ?
            this.createRowEvent(Events.EVENT_ROW_EDITING_STARTED) as RowEditingStartedEvent
            : this.createRowEvent(Events.EVENT_ROW_EDITING_STOPPED) as RowEditingStoppedEvent;

        this.beans.eventService.dispatchEvent(event);
    }

    public startRowEditing(keyPress: number | null = null, charPress: string | null = null, sourceRenderedCell: CellComp | null = null): void {
        // don't do it if already editing
        if (this.editingRow) { return; }

        this.forEachCellComp(renderedCell => {
            const cellStartedEdit = renderedCell === sourceRenderedCell;
            if (cellStartedEdit) {
                renderedCell.startEditingIfEnabled(keyPress, charPress, cellStartedEdit);
            } else {
                renderedCell.startEditingIfEnabled(null, null, cellStartedEdit);
            }
        });
        this.setEditingRow(true);
    }

    public forEachCellComp(callback: (renderedCell: CellComp) => void): void {
        _.iterateObject(this.cellComps, (key: any, cellComp: CellComp) => {
            if (!cellComp) { return; }

            callback(cellComp);
        });
    }

    private postProcessClassesFromGridOptions(): void {
        const cssClasses = this.processClassesFromGridOptions();
        if (!cssClasses || !cssClasses.length) { return; }

        cssClasses.forEach(classStr => {
            this.eAllRowContainers.forEach(row => _.addCssClass(row, classStr));
        });
    }

    private postProcessRowClassRules(): void {
        this.processRowClassRules(
            (className: string) => {
                this.eAllRowContainers.forEach(row => _.addCssClass(row, className));
            },
            (className: string) => {
                this.eAllRowContainers.forEach(row => _.removeCssClass(row, className));
            }
        );
    }

    private processClassesFromGridOptions(): string[] {
        const res: string[] = [];

        const process = (rowCls: string | string[]) => {
            if (typeof rowCls === 'string') {
                res.push(rowCls);
            } else if (Array.isArray(rowCls)) {
                rowCls.forEach(e => res.push(e));
            }
        };

        // part 1 - rowClass
        const rowClass = this.beans.gridOptionsWrapper.getRowClass();
        if (rowClass) {
            if (typeof rowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
                return;
            }
            process(rowClass);
        }

        // part 2 - rowClassFunc
        const rowClassFunc = this.beans.gridOptionsWrapper.getRowClassFunc();
        if (rowClassFunc) {
            const params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowNode.rowIndex,
                context: this.beans.gridOptionsWrapper.getContext(),
                api: this.beans.gridOptionsWrapper.getApi()
            };
            const rowClassFuncResult = rowClassFunc(params);
            process(rowClassFuncResult);
        }

        return res;
    }

    private preProcessStylesFromGridOptions(): string {
        const rowStyles = this.processStylesFromGridOptions();
        return _.cssStyleObjectToMarkup(rowStyles);
    }

    private postProcessStylesFromGridOptions(): void {
        const rowStyles = this.processStylesFromGridOptions();
        this.eAllRowContainers.forEach(row => _.addStylesToElement(row, rowStyles));
    }

    private processStylesFromGridOptions(): any {
        // part 1 - rowStyle
        const rowStyle = this.beans.gridOptionsWrapper.getRowStyle();

        if (rowStyle && typeof rowStyle === 'function') {
            console.warn('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            return;
        }

        // part 1 - rowStyleFunc
        const rowStyleFunc = this.beans.gridOptionsWrapper.getRowStyleFunc();
        let rowStyleFuncResult: any;

        if (rowStyleFunc) {
            const params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            rowStyleFuncResult = rowStyleFunc(params);
        }

        return _.assign({}, rowStyle, rowStyleFuncResult);
    }

    private createCells(cols: Column[]): {template: string, cellComps: CellComp[]} {
        const templateParts: string[] = [];
        const newCellComps: CellComp[] = [];

        cols.forEach(col => {
            const newCellComp = new CellComp(this.scope, this.beans, col, this.rowNode, this,
                false, this.printLayout);
            const cellTemplate = newCellComp.getCreateTemplate();
            templateParts.push(cellTemplate);
            newCellComps.push(newCellComp);
            this.cellComps[col.getId()] = newCellComp;
        });

        const templateAndComps = {
            template: templateParts.join(''),
            cellComps: newCellComps
        };
        return templateAndComps;
    }

    private onRowSelected(): void {
        const selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach((row) => _.addOrRemoveCssClass(row, 'ag-row-selected', selected));
    }

    // called:
    // + after row created for first time
    // + after horizontal scroll, so new cells due to column virtualisation
    private callAfterRowAttachedOnCells(newCellComps: CellComp[], eRow: HTMLElement): void {
        newCellComps.forEach(cellComp => {
            cellComp.setParentRow(eRow);
            cellComp.afterAttached();

            // if we are editing the row, then the cell needs to turn
            // into edit mode
            if (this.editingRow) {
                cellComp.startEditingIfEnabled();
            }
        });
    }

    private afterRowAttached(rowContainerComp: RowContainerComponent, eRow: HTMLElement): void {
        this.addDomData(eRow);

        this.removeSecondPassFuncs.push(() => {
            rowContainerComp.removeRowElement(eRow);
        });

        this.removeFirstPassFuncs.push(() => {
            if (_.exists(this.rowNode.rowTop)) {
                // the row top is updated anyway, however we set it here again
                // to something more reasonable for the animation - ie if the
                // row top is 10000px away, the row will flash out, so this
                // gives it a rounded value, so row animates out more slowly
                const rowTop = this.roundRowTopToBounds(this.rowNode.rowTop);
                this.setRowTop(rowTop);
            } else {
                _.addCssClass(eRow, 'ag-opacity-zero');
            }
        });

        this.eAllRowContainers.push(eRow);

        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.useAnimationFrameForCreate) {
            this.beans.taskQueue.addP2Task(this.addHoverFunctionality.bind(this, eRow));
        } else {
            this.addHoverFunctionality(eRow);
        }
    }

    private addHoverFunctionality(eRow: HTMLElement): void {
        // because we use animation frames to do this, it's possible the row no longer exists
        // by the time we get to add it
        if (!this.active) { return; }

        // because mouseenter and mouseleave do not propagate, we cannot listen on the gridPanel
        // like we do for all the other mouse events.

        // because of the pinning, we cannot simply add / remove the class based on the eRow. we
        // have to check all eRow's (body & pinned). so the trick is if any of the rows gets a
        // mouse hover, it sets such in the rowNode, and then all three reflect the change as
        // all are listening for event on the row node.

        // step 1 - add listener, to set flag on row node
        this.addDestroyableEventListener(eRow, 'mouseenter', () => this.rowNode.onMouseEnter());
        this.addDestroyableEventListener(eRow, 'mouseleave', () => this.rowNode.onMouseLeave());

        // step 2 - listen for changes on row node (which any eRow can trigger)
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_MOUSE_ENTER, () => {
            // if hover turned off, we don't add the class. we do this here so that if the application
            // toggles this property mid way, we remove the hover form the last row, but we stop
            // adding hovers from that point onwards.
            if (!this.beans.gridOptionsWrapper.isSuppressRowHoverHighlight()) {
                _.addCssClass(eRow, 'ag-row-hover');
            }
        });

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_MOUSE_LEAVE, () => {
            _.removeCssClass(eRow, 'ag-row-hover');
        });
    }

    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    private roundRowTopToBounds(rowTop: number): number {
        const range = this.beans.gridPanel.getVScrollPosition();
        const minPixel = this.applyPaginationOffset(range.top, true) - 100;
        const maxPixel = this.applyPaginationOffset(range.bottom, true) + 100;

        return Math.min(Math.max(minPixel, rowTop), maxPixel);
    }

    protected getFrameworkOverrides(): IFrameworkOverrides {
        return this.beans.frameworkOverrides;
    }

    private onRowHeightChanged(): void {
        // check for exists first - if the user is resetting the row height, then
        // it will be null (or undefined) momentarily until the next time the flatten
        // stage is called where the row will then update again with a new height
        if (_.exists(this.rowNode.rowHeight)) {
            const heightPx = `${this.rowNode.rowHeight}px`;

            this.eAllRowContainers.forEach(row => row.style.height = heightPx);
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        super.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved and rowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        super.removeEventListener(eventType, listener);
    }

    public destroy(animate = false): void {
        super.destroy();

        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        this.destroyFullWidthComponents();

        if (animate) {
            this.removeFirstPassFuncs.forEach(func => func());
            this.removeSecondPassFuncs.push(this.destroyContainingCells.bind(this));
        } else {
            this.destroyContainingCells();

            // we are not animating, so execute the second stage of removal now.
            // we call getAndClear, so that they are only called once
            const delayedDestroyFunctions = this.getAndClearDelayedDestroyFunctions();
            delayedDestroyFunctions.forEach(func => func());
        }

        const event: VirtualRowRemovedEvent = this.createRowEvent(Events.EVENT_VIRTUAL_ROW_REMOVED);

        this.dispatchEvent(event);
        this.beans.eventService.dispatchEvent(event);
    }

    private destroyContainingCells(): void {
        this.forEachCellComp(renderedCell => renderedCell.destroy());
        this.destroyFullWidthComponents();
    }

    // we clear so that the functions are never executed twice
    public getAndClearDelayedDestroyFunctions(): Function[] {
        const result = this.removeSecondPassFuncs;
        this.removeSecondPassFuncs = [];
        return result;
    }

    private onCellFocusChanged(): void {
        const rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);

        if (rowFocused !== this.rowFocused) {
            this.eAllRowContainers.forEach(row => _.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused));
            this.eAllRowContainers.forEach(row => _.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused));
            this.rowFocused = rowFocused;
        }

        // if we are editing, then moving the focus out of a row will stop editing
        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    }

    private onPaginationChanged(): void {
        const currentPage = this.beans.paginationProxy.getCurrentPage();
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        if (this.paginationPage !== currentPage) {
            this.paginationPage = currentPage;
            this.onTopChanged();
        }
    }

    private onTopChanged(): void {
        this.setRowTop(this.rowNode.rowTop);
    }

    // applies pagination offset, eg if on second page, and page height is 500px, then removes
    // 500px from the top position, so a row with rowTop 600px is displayed at location 100px.
    // reverse will take the offset away rather than add.
    private applyPaginationOffset(topPx: number, reverse = false): number {
        if (this.rowNode.isRowPinned()) {
            return topPx;
        }

        const pixelOffset = this.beans.paginationProxy.getPixelOffset();
        const multiplier = reverse ? 1 : -1;

        return topPx + (pixelOffset * multiplier);
    }

    private setRowTop(pixels: number): void {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) { return; }

        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (_.exists(pixels)) {
            const afterPaginationPixels = this.applyPaginationOffset(pixels);
            const afterScalingPixels = this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
            const topPx = `${afterScalingPixels}px`;

            if (this.beans.gridOptionsWrapper.isSuppressRowTransform()) {
                this.eAllRowContainers.forEach(row => row.style.top = topPx);
            } else {
                this.eAllRowContainers.forEach(row => row.style.transform = `translateY(${topPx})`);
            }
        }
    }

    // we clear so that the functions are never executed twice
    public getAndClearNextVMTurnFunctions(): Function[] {
        const result = this.createSecondPassFuncs;
        this.createSecondPassFuncs = [];
        return result;
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public getRenderedCellForColumn(column: Column): CellComp | undefined {
        const cellComp = this.cellComps[column.getColId()];

        if (cellComp) {
            return cellComp;
        }

        const spanList = Object.keys(this.cellComps)
            .map(name => this.cellComps[name])
            .filter(cmp => cmp && cmp.getColSpanningList().indexOf(column) !== -1);

        return spanList.length ? spanList[0] : undefined;
    }

    private onRowIndexChanged(): void {
        this.onCellFocusChanged();
        this.updateRowIndexes();
    }

    private updateRowIndexes(): void {
        const rowIndexStr = this.rowNode.getRowIndexString();
        const rowIsEven = this.rowNode.rowIndex % 2 === 0;
        const rowIsEvenChanged = this.rowIsEven !== rowIsEven;

        if (rowIsEvenChanged) {
            this.rowIsEven = rowIsEven;
        }

        this.eAllRowContainers.forEach(eRow => {
            eRow.setAttribute('row-index', rowIndexStr);

            if (!rowIsEvenChanged) { return; }
            _.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
            _.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
        });
    }

    public ensureDomOrder(): void {
        const sides = [
            {
                el: this.getBodyRowElement(),
                ct: this.bodyContainerComp
            },
            {
                el: this.getPinnedLeftRowElement(),
                ct: this.pinnedLeftContainerComp
            }, {
                el: this.getPinnedRightRowElement(),
                ct: this.pinnedRightContainerComp
            }, {
                el: this.getFullWidthRowElement(),
                ct: this.fullWidthContainerComp
            }
        ];

        sides.forEach(side => {
            if (!side.el) { return; }
            side.ct.ensureDomOrder(side.el);
        });
    }

    // returns the pinned left container, either the normal one, or the embedded full with one if exists
    public getPinnedLeftRowElement(): HTMLElement {
        return this.ePinnedLeftRow ? this.ePinnedLeftRow : this.eFullWidthRowLeft;
    }

    // returns the pinned right container, either the normal one, or the embedded full with one if exists
    public getPinnedRightRowElement(): HTMLElement {
        return this.ePinnedRightRow ? this.ePinnedRightRow : this.eFullWidthRowRight;
    }

    // returns the body container, either the normal one, or the embedded full with one if exists
    public getBodyRowElement(): HTMLElement {
        return this.eBodyRow ? this.eBodyRow : this.eFullWidthRowBody;
    }

    // returns the full width container
    public getFullWidthRowElement(): HTMLElement {
        return this.eFullWidthRow;
    }

}
