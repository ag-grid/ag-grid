import { Beans } from "../beans";
import { CellComp } from "../cellComp";
import { DataChangedEvent, RowNode } from "../../entities/rowNode";
import { Column } from "../../entities/column";
import {
    CellFocusedEvent,
    Events,
    RowClickedEvent,
    RowDoubleClickedEvent,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowEvent,
    RowValueChangedEvent,
    VirtualRowRemovedEvent
} from "../../events";

import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { RowContainerComponent } from "./rowContainerComponent";
import { Component } from "../../widgets/component";

import { ProcessRowParams, RowClassParams } from "../../entities/gridOptions";
import { IFrameworkOverrides } from "../../interfaces/iFrameworkOverrides";
import { Constants } from "../../constants/constants";
import { ModuleNames } from "../../modules/moduleNames";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { setAriaExpanded, setAriaSelected, setAriaLabel, setAriaRowIndex } from "../../utils/aria";
import { escapeString } from "../../utils/string";
import { removeCssClass, addCssClass, addOrRemoveCssClass, setDomChildOrder, appendHtml, isElementChildOfClass, addStylesToElement } from "../../utils/dom";
import { removeFromArray } from "../../utils/array";
import { missing, exists } from "../../utils/generic";
import { isStopPropagationForAgGrid } from "../../utils/event";
import { iterateObject, assign } from "../../utils/object";
import { cssStyleObjectToMarkup } from "../../utils/general";
import { AngularRowUtils } from "./angularRowUtils";
import { CellPosition } from "../../entities/cellPosition";
import { RowPosition } from "../../entities/rowPosition";

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

    private fullWidthRowComponent: ICellRendererComp | null | undefined;
    private fullWidthRowComponentBody: ICellRendererComp | null | undefined;
    private fullWidthRowComponentLeft: ICellRendererComp | null | undefined;
    private fullWidthRowComponentRight: ICellRendererComp | null | undefined;

    private fullWidthRowDestroyFuncs: (() => void)[] = [];

    private firstRowOnPage: boolean;
    private lastRowOnPage: boolean;

    private active = true;

    private fullWidthRow: boolean;

    private editingRow: boolean;
    private rowFocused: boolean;

    private rowContainerReadyCount = 0;
    private refreshNeeded = false;
    private columnRefreshPending = false;

    private cellComps: { [key: string]: CellComp | null; } = {};

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

    private elementOrderChanged = false;
    private lastMouseDownOnDragger = false;

    private rowLevel: number;

    private readonly printLayout: boolean;
    private readonly embedFullWidth: boolean;

    constructor(
        parentScope: any,
        bodyContainerComp: RowContainerComponent,
        pinnedLeftContainerComp: RowContainerComponent,
        pinnedRightContainerComp: RowContainerComponent,
        fullWidthContainerComp: RowContainerComponent,
        rowNode: RowNode,
        beans: Beans,
        animateIn: boolean,
        useAnimationFrameForCreate: boolean,
        printLayout: boolean,
        embedFullWidth: boolean
    ) {
        super();
        this.parentScope = parentScope;
        this.beans = beans;
        this.bodyContainerComp = bodyContainerComp;
        this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        this.pinnedRightContainerComp = pinnedRightContainerComp;
        this.fullWidthContainerComp = fullWidthContainerComp;
        this.rowNode = rowNode;
        this.rowIsEven = this.rowNode.rowIndex! % 2 === 0;
        this.paginationPage = this.beans.paginationProxy.getCurrentPage();
        this.useAnimationFrameForCreate = useAnimationFrameForCreate;
        this.printLayout = printLayout;
        this.embedFullWidth = embedFullWidth;

        this.setAnimateFlags(animateIn);
    }

    public init(): void {
        this.rowFocused = this.beans.focusController.isRowFocused(this.rowNode.rowIndex!, this.rowNode.rowPinned);
        this.setupAngular1Scope();
        this.rowLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);

        this.setupRowContainers();
        this.addListeners();

        if (this.slideRowIn) {
            this.createSecondPassFuncs.push(() => {
                this.onTopChanged();
            });
        }
        if (this.fadeRowIn) {
            this.createSecondPassFuncs.push(() => {
                this.eAllRowContainers.forEach(eRow => removeCssClass(eRow, 'ag-opacity-zero'));
            });
        }
    }

    private setupAngular1Scope(): void {
        const scopeResult = AngularRowUtils.createChildScopeOrNull(this.rowNode, this.parentScope, this.beans.gridOptionsWrapper);
        if (scopeResult) {
            this.scope = scopeResult.scope;
            this.addDestroyFunc(scopeResult.scopeDestroyFunc);
        }
    }

    private createTemplate(contents: string, extraCssClass: string | null = null): string {
        const templateParts: string[] = [];
        const rowHeight = this.rowNode.rowHeight;
        const rowClasses = this.getInitialRowClasses(extraCssClass!).join(' ');
        const rowIdSanitised = escapeString(this.rowNode.id!);
        const userRowStyles = this.preProcessStylesFromGridOptions();
        const businessKey = this.getRowBusinessKey();
        const businessKeySanitised = escapeString(businessKey!);
        const rowTopStyle = this.getInitialRowTopStyle();
        const rowIdx = this.rowNode.getRowIndexString();
        const headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();

        templateParts.push(`<div`);
        templateParts.push(` role="row"`);
        templateParts.push(` row-index="${rowIdx}" aria-rowindex="${headerRowCount + this.rowNode.rowIndex! + 1}"`);
        templateParts.push(rowIdSanitised ? ` row-id="${rowIdSanitised}"` : ``);
        templateParts.push(businessKey ? ` row-business-key="${businessKeySanitised}"` : ``);
        templateParts.push(` comp-id="${this.getCompId()}"`);
        templateParts.push(` class="${rowClasses}"`);

        if (this.fullWidthRow) {
            templateParts.push(` tabindex="-1"`);
        }

        if (this.beans.gridOptionsWrapper.isRowSelection()) {
            templateParts.push(` aria-selected="${this.rowNode.isSelected() ? 'true' : 'false'}"`);
        }

        if (this.rowNode.group) {
            templateParts.push(` aria-expanded=${this.rowNode.expanded ? 'true' : 'false'}`);
        }

        templateParts.push(` style="height: ${rowHeight}px; ${rowTopStyle} ${userRowStyles}">`);

        // add in the template for the cells
        templateParts.push(contents);
        templateParts.push(`</div>`);

        return templateParts.join('');
    }

    public getCellForCol(column: Column): HTMLElement | null {
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
            api: this.beans.gridOptionsWrapper.getApi()!,
            rowIndex: this.rowNode.rowIndex!,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            context: this.beans.gridOptionsWrapper.getContext()
        };
        func(params);
    }

    private getInitialRowTopStyle() {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) { return ''; }

        // if sliding in, we take the old row top. otherwise we just set the current row top.
        const pixels = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop!) : this.rowNode.rowTop;
        const afterPaginationPixels = this.applyPaginationOffset(pixels!);
        // we don't apply scaling if row is pinned
        const afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
        const isSuppressRowTransform = this.beans.gridOptionsWrapper.isSuppressRowTransform();

        return isSuppressRowTransform ? `top: ${afterScalingPixels}px; ` : `transform: translateY(${afterScalingPixels}px);`;
    }

    private getRowBusinessKey(): string | undefined {
        const businessKeyForNodeFunc = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc();
        if (typeof businessKeyForNodeFunc !== 'function') { return; }

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

    private createRowContainer(
        rowContainerComp: RowContainerComponent,
        cols: Column[],
        callback: (eRow: HTMLElement) => void
    ): void {
        const useAnimationsFrameForCreate = this.useAnimationFrameForCreate;
        const cellTemplatesAndComps: CellTemplate = useAnimationsFrameForCreate ? { cellComps: [], template: '' } : this.createCells(cols);
        const rowTemplate = this.createTemplate(cellTemplatesAndComps.template);

        // the RowRenderer is probably inserting many rows. rather than inserting each template one
        // at a time, the grid inserts all rows together - so the callback here is called by the
        // rowRenderer when all RowComps are created, then all the HTML is inserted in one go,
        // and then all the callbacks are called. this is NOT done in an animation frame.
        rowContainerComp.appendRowTemplate(rowTemplate, () => {
            const eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());
            this.refreshAriaLabel(eRow, !!this.rowNode.isSelected());
            this.afterRowAttached(rowContainerComp, eRow);
            callback(eRow);

            if (useAnimationsFrameForCreate) {
                this.beans.taskQueue.createTask(
                    this.lazyCreateCells.bind(this, cols, eRow),
                    this.rowNode.rowIndex!,
                    'createTasksP1'
                );
            } else {
                this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
                this.rowContainerReadyCount = 3;
            }
        });
    }

    private setupRowContainers(): void {
        const isFullWidthCell = this.rowNode.isFullWidthCell();
        const isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;
        const pivotMode = this.beans.columnController.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        const isGroupRow = this.rowNode.group && !this.rowNode.footer;
        const isFullWidthGroup = isGroupRow && this.beans.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);

        if (this.rowNode.stub) {
            this.createFullWidthRows(RowComp.LOADING_CELL_RENDERER, RowComp.LOADING_CELL_RENDERER_COMP_NAME, false);
        } else if (isDetailCell) {
            this.createFullWidthRows(RowComp.DETAIL_CELL_RENDERER, RowComp.DETAIL_CELL_RENDERER_COMP_NAME, true);
        } else if (isFullWidthCell) {
            this.createFullWidthRows(RowComp.FULL_WIDTH_CELL_RENDERER, null, false);
        } else if (isFullWidthGroup) {
            this.createFullWidthRows(RowComp.GROUP_ROW_RENDERER, RowComp.GROUP_ROW_RENDERER_COMP_NAME, false);
        } else {
            this.setupNormalRowContainers();
        }
    }

    private setupNormalRowContainers(): void {
        let centerCols: Column[];
        let leftCols: Column[] = [];
        let rightCols: Column[] = [];

        if (this.printLayout) {
            centerCols = this.beans.columnController.getAllDisplayedColumns();
        } else {
            centerCols = this.beans.columnController.getViewportCenterColumnsForRow(this.rowNode);
            leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }

        this.createRowContainer(this.bodyContainerComp, centerCols, eRow => this.eBodyRow = eRow);
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, eRow => this.ePinnedRightRow = eRow);
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, eRow => this.ePinnedLeftRow = eRow);
    }

    private createFullWidthRows(type: string, name: string | null, detailRow: boolean): void {
        this.fullWidthRow = true;

        if (this.embedFullWidth) {
            this.createFullWidthRowContainer(this.bodyContainerComp, null,
                null, type, name!,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowBody = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentBody = cellRenderer;
                },
                detailRow);

            // printLayout doesn't put components into the pinned sections
            if (this.printLayout) { return; }

            this.createFullWidthRowContainer(this.pinnedLeftContainerComp, Constants.PINNED_LEFT,
                'ag-cell-last-left-pinned', type, name!,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowLeft = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentLeft = cellRenderer;
                },
                detailRow);
            this.createFullWidthRowContainer(this.pinnedRightContainerComp, Constants.PINNED_RIGHT,
                'ag-cell-first-right-pinned', type, name!,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowRight = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentRight = cellRenderer;
                },
                detailRow);
        } else {
            // otherwise we add to the fullWidth container as normal
            // let previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.createFullWidthRowContainer(this.fullWidthContainerComp, null,
                null, type, name!,
                (eRow: HTMLElement) => {
                    this.eFullWidthRow = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponent = cellRenderer;
                },
                detailRow
            );
        }
    }

    private setAnimateFlags(animateIn: boolean): void {
        if (animateIn) {
            const oldRowTopExists = exists(this.rowNode.oldRowTop);
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
        const tryRefresh = (eRow: HTMLElement, cellComp: ICellRendererComp | null | undefined, pinned: string | null): boolean => {
            if (!eRow || !cellComp) { return true; } // no refresh needed

            // no refresh method present, so can't refresh, hard refresh needed
            if (!cellComp.refresh) { return false; }

            const params = this.createFullWidthParams(eRow, pinned);
            const refreshSucceeded = cellComp.refresh(params);

            return refreshSucceeded;
        };

        const normalSuccess = tryRefresh(this.eFullWidthRow, this.fullWidthRowComponent, null);
        const bodySuccess = tryRefresh(this.eFullWidthRowBody, this.fullWidthRowComponentBody, null);
        const leftSuccess = tryRefresh(this.eFullWidthRowLeft, this.fullWidthRowComponentLeft, Constants.PINNED_LEFT);
        const rightSuccess = tryRefresh(this.eFullWidthRowRight, this.fullWidthRowComponentRight, Constants.PINNED_RIGHT);

        const allFullWidthRowsRefreshed = normalSuccess && bodySuccess && leftSuccess && rightSuccess;

        return allFullWidthRowsRefreshed;
    }

    private addListeners(): void {
        this.addManagedListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_EXPANDED_CHANGED, this.updateExpandedCss.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_HAS_CHILDREN_CHANGED, this.updateExpandedCss.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.onRowNodeCellChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_HIGHLIGHT_CHANGED, this.onRowNodeHighlightChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_DRAGGING_CHANGED, this.onRowNodeDraggingChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_UI_LEVEL_CHANGED, this.onUiLevelChanged.bind(this));

        const eventService = this.beans.eventService;
        this.addManagedListener(eventService, Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED, this.onPaginationPixelOffsetChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addManagedListener(eventService, Events.EVENT_COLUMN_MOVED, this.onColumnMoved.bind(this));

        this.addListenersForCellComps();
    }

    private addListenersForCellComps(): void {

        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, () => {
            this.forEachCellComp(cellComp => cellComp.onRowIndexChanged());
        });
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, event => {
            this.forEachCellComp(cellComp => cellComp.onCellChanged(event));
        });

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

    private onRowNodeCellChanged(): void {
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    }

    private postProcessCss(): void {
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    }

    private onRowNodeHighlightChanged(): void {
        const highlighted = this.rowNode.highlighted;

        this.eAllRowContainers.forEach(row => {
            removeCssClass(row, 'ag-row-highlight-above');
            removeCssClass(row, 'ag-row-highlight-below');
            if (highlighted) {
                addCssClass(row, 'ag-row-highlight-' + highlighted);
            }
        });
    }

    private onRowNodeDraggingChanged(): void {
        this.postProcessRowDragging();
    }

    private postProcessRowDragging(): void {
        const dragging = this.rowNode.dragging;
        this.eAllRowContainers.forEach(row => addOrRemoveCssClass(row, 'ag-row-dragging', dragging));
    }

    private updateExpandedCss(): void {

        const expandable = this.rowNode.isExpandable();
        const expanded = this.rowNode.expanded == true;

        this.eAllRowContainers.forEach(eRow => {
            addOrRemoveCssClass(eRow, 'ag-row-group', expandable);
            addOrRemoveCssClass(eRow, 'ag-row-group-expanded', expandable && expanded);
            addOrRemoveCssClass(eRow, 'ag-row-group-contracted', expandable && !expanded);
            setAriaExpanded(eRow, expandable && expanded);
        });
    }

    private onDisplayedColumnsChanged(): void {
        if (this.fullWidthRow) { return; }

        this.refreshCells();
    }

    private destroyFullWidthComponents(): void {

        this.fullWidthRowDestroyFuncs.forEach(f => f());
        this.fullWidthRowDestroyFuncs = [];

        if (this.fullWidthRowComponent) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponentBody);
            this.fullWidthRowComponentBody = null;
        }
        if (this.fullWidthRowComponentLeft) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, Constants.PINNED_LEFT, this.fullWidthRowComponentLeft);
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, Constants.PINNED_RIGHT, this.fullWidthRowComponentRight);
            this.fullWidthRowComponentRight = null;
        }
    }

    private getContainerForCell(pinnedType: string): HTMLElement {
        switch (pinnedType) {
            case Constants.PINNED_LEFT: return this.ePinnedLeftRow;
            case Constants.PINNED_RIGHT: return this.ePinnedRightRow;
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

    public getRowPosition(): RowPosition {
        return {
            rowPinned: this.rowNode.rowPinned,
            rowIndex: this.rowNode.rowIndex as number
        };
    }

    public onKeyboardNavigate(keyboardEvent: KeyboardEvent) {
        const node = this.rowNode;
        const lastFocusedCell = this.beans.focusController.getFocusedCell();
        const cellPosition: CellPosition = {
            rowIndex: node.rowIndex!,
            rowPinned: node.rowPinned,
            column: (lastFocusedCell && lastFocusedCell.column) as Column
        };
        this.beans.rowRenderer.navigateToNextCell(keyboardEvent, keyboardEvent.keyCode, cellPosition, true);
        keyboardEvent.preventDefault();
    }

    public onTabKeyDown(keyboardEvent: KeyboardEvent) {
        if (this.isFullWidth()) {
            this.beans.rowRenderer.onTabKeyDown(this, keyboardEvent);
        }
    }

    public onFullWidthRowFocused(event: CellFocusedEvent) {
        const node = this.rowNode;
        const isFocused = this.fullWidthRow && event.rowIndex === node.rowIndex && event.rowPinned == node.rowPinned;

        addOrRemoveCssClass(this.eFullWidthRow, 'ag-full-width-focus', isFocused);

        if (isFocused) {
            const focusEl = this.embedFullWidth ? this.eFullWidthRowBody : this.eFullWidthRow;
            focusEl.focus();
        }
    }

    public refreshCell(cellComp: CellComp) {
        if (!this.areAllContainersReady()) { return; }

        this.destroyCells([cellComp.getColumn().getId()]);
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

            this.beans.taskQueue.createTask(
                this.refreshCellsInAnimationFrame.bind(this),
                this.rowNode.rowIndex!,
                'createTasksP1'
            );
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
            centerCols = this.beans.columnController.getViewportCenterColumnsForRow(this.rowNode);
            leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }

        this.insertCellsIntoContainer(this.eBodyRow, centerCols);
        this.insertCellsIntoContainer(this.ePinnedLeftRow, leftCols);
        this.insertCellsIntoContainer(this.ePinnedRightRow, rightCols);
        this.elementOrderChanged = false;

        const colIdsToRemove = Object.keys(this.cellComps);
        centerCols.forEach(col => removeFromArray(colIdsToRemove, col.getId()));
        leftCols.forEach(col => removeFromArray(colIdsToRemove, col.getId()));
        rightCols.forEach(col => removeFromArray(colIdsToRemove, col.getId()));

        // we never remove editing cells, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally.
        const eligibleToBeRemoved = colIdsToRemove.filter(this.isCellEligibleToBeRemoved.bind(this));

        // remove old cells from gui, but we don't destroy them, we might use them again
        this.destroyCells(eligibleToBeRemoved);
    }

    private onColumnMoved() {
        this.elementOrderChanged = true;
    }

    private destroyCells(colIds: string[]): void {
        colIds.forEach((key: string) => {
            const cellComp = this.cellComps[key];
            // could be old reference, ie removed cell
            if (missing(cellComp)) { return; }

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

        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        if (!renderedCell || this.isCellInWrongRow(renderedCell)) { return REMOVE_CELL; }

        // we want to try and keep editing and focused cells
        const editing = renderedCell.isEditing();
        const focused = this.beans.focusController.isCellFocused(renderedCell.getCellPosition());

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
        const eContainer = this.getContainerForCell(pinnedType!);

        // if in wrong container, remove it
        const eOldContainer = cellComp.getParentRow();
        const inWrongRow = eOldContainer !== eContainer;
        if (inWrongRow) {
            // take out from old row
            if (eOldContainer) { eOldContainer.removeChild(element); }

            eContainer.appendChild(element);
            cellComp.setParentRow(eContainer);
            this.elementOrderChanged = true;
        }
    }

    private isCellInWrongRow(cellComp: CellComp): boolean {
        const column = cellComp.getColumn();
        const rowWeWant = this.getContainerForCell(column.getPinned()!);
        const oldRow = cellComp.getParentRow(); // if in wrong container, remove it

        return oldRow !== rowWeWant;
    }

    private insertCellsIntoContainer(eRow: HTMLElement, cols: Column[]): void {
        if (!eRow) { return; }

        const cellTemplates: string[] = [];
        const newCellComps: CellComp[] = [];

        cols.forEach(col => {
            const colId = col.getId();
            const existingCell = this.cellComps[colId];

            // need to check the column is the same one, not a new column with the same ID
            if (existingCell && existingCell.getColumn() == col) {
                this.ensureCellInCorrectContainer(existingCell);
            } else {
                if (existingCell) {
                    // here there is a col with the same id, so need to destroy the old cell first,
                    // as the old column no longer exists. this happens often with pivoting, where
                    // id's are pivot_1, pivot_2 etc, so common for new cols with same ID's
                    this.destroyCells([colId]);
                }
                this.createNewCell(col, eRow, cellTemplates, newCellComps);
            }

        });

        if (cellTemplates.length > 0) {
            appendHtml(eRow, cellTemplates.join(''));
            this.callAfterRowAttachedOnCells(newCellComps, eRow);
        }

        if (this.elementOrderChanged && this.beans.gridOptionsWrapper.isEnsureDomOrder()) {
            const correctChildOrder = cols.map(col => this.getCellForCol(col));
            setDomChildOrder(eRow, correctChildOrder);
        }
    }

    private addDomData(eRowContainer: Element): void {
        const gow = this.beans.gridOptionsWrapper;
        gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc(() => {
            gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, null);
        }
        );
    }

    private createNewCell(col: Column, eContainer: HTMLElement, cellTemplates: string[], newCellComps: CellComp[]): void {
        const newCellComp = new CellComp(this.scope, this.beans, col, this.rowNode, this, false, this.printLayout);
        const cellTemplate = newCellComp.getCreateTemplate();
        cellTemplates.push(cellTemplate);
        newCellComps.push(newCellComp);
        this.cellComps[col.getId()] = newCellComp;
        newCellComp.setParentRow(eContainer);
        this.elementOrderChanged = true;
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick': this.onRowDblClick(mouseEvent); break;
            case 'click': this.onRowClick(mouseEvent); break;
            case 'mousedown': this.onRowMouseDown(mouseEvent); break;
        }
    }

    private createRowEvent(type: string, domEvent?: Event): RowEvent {
        return {
            type: type,
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex!,
            rowPinned: this.rowNode.rowPinned,
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridOptionsWrapper.getApi()!,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
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
        if (isStopPropagationForAgGrid(mouseEvent)) { return; }

        const agEvent: RowDoubleClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);
    }

    private onRowMouseDown(mouseEvent: MouseEvent) {
        this.lastMouseDownOnDragger = isElementChildOfClass(mouseEvent.target as HTMLElement, 'ag-row-drag', 3);

        if (!this.isFullWidth()) { return; }

        const node = this.rowNode;
        const columnController = this.beans.columnController;

        this.beans.focusController.setFocusedCell(
            node.rowIndex!,
            columnController.getAllDisplayedColumns()[0],
            node.rowPinned, true
        );

    }

    public onRowClick(mouseEvent: MouseEvent) {
        const stop = isStopPropagationForAgGrid(mouseEvent) || this.lastMouseDownOnDragger;

        if (stop) { return; }

        const agEvent: RowClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);

        // ctrlKey for windows, metaKey for Apple
        const multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        const shiftKeyPressed = mouseEvent.shiftKey;

        // we do not allow selecting the group by clicking, when groupSelectChildren, as the logic to
        // handle this is broken. to observe, change the logic below and allow groups to be selected.
        // you will see the group gets selected, then all children get selected, then the grid unselects
        // the children (as the default behaviour when clicking is to unselect other rows) which results
        // in the group getting unselected (as all children are unselected). the correct thing would be
        // to change this, so that children of the selected group are not then subsequenly un-selected.
        const groupSelectsChildren = this.beans.gridOptionsWrapper.isGroupSelectsChildren();

        if (
            // we do not allow selecting groups by clicking (as the click here expands the group), or if it's a detail row,
            // so return if it's a group row
            (groupSelectsChildren && this.rowNode.group) ||
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
        const rowDeselectionWithCtrl = !this.beans.gridOptionsWrapper.isSuppressRowDeselection();

        if (this.rowNode.isSelected()) {
            if (multiSelectOnClick) {
                this.rowNode.setSelectedParams({ newValue: false });
            } else if (multiSelectKeyPressed) {
                if (rowDeselectionWithCtrl) {
                    this.rowNode.setSelectedParams({ newValue: false });
                }
            } else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({ newValue: !shiftKeyPressed, clearSelection: !shiftKeyPressed, rangeSelect: shiftKeyPressed });
            }
        } else {
            const clearSelection = multiSelectOnClick ? false : !multiSelectKeyPressed;
            this.rowNode.setSelectedParams({ newValue: true, clearSelection: clearSelection, rangeSelect: shiftKeyPressed });
        }
    }

    private createFullWidthRowContainer(
        rowContainerComp: RowContainerComponent,
        pinned: string | null,
        extraCssClass: string | null,
        cellRendererType: string,
        cellRendererName: string,
        eRowCallback: (eRow: HTMLElement) => void,
        cellRendererCallback: (comp: ICellRendererComp) => void,
        detailRow: boolean
    ): void {
        const rowTemplate = this.createTemplate('', extraCssClass);

        rowContainerComp.appendRowTemplate(rowTemplate, () => {
            const eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());
            const params = this.createFullWidthParams(eRow, pinned);

            const callback = (cellRenderer: ICellRendererComp) => {
                if (this.isAlive()) {
                    const eGui = cellRenderer.getGui();
                    eRow.appendChild(eGui);
                    if (detailRow) {
                        this.setupDetailRowAutoHeight(eGui);
                    }
                    cellRendererCallback(cellRenderer);
                } else {
                    this.beans.context.destroyBean(cellRenderer);
                }
            };

            // if doing master detail, it's possible we have a cached row comp from last time detail was displayed
            const cachedRowComp = this.beans.detailRowCompCache.get(this.rowNode, pinned);
            if (cachedRowComp) {
                callback(cachedRowComp);
            } else {
                const res = this.beans.userComponentFactory.newFullWidthCellRenderer(params, cellRendererType, cellRendererName);
                if (!res) {
                    const masterDetailModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.MasterDetailModule);
                    if (cellRendererName === 'agDetailCellRenderer' && !masterDetailModuleLoaded) {
                        console.warn(`AG Grid: cell renderer agDetailCellRenderer (for master detail) not found. Did you forget to include the master detail module?`);
                    } else {
                        console.error(`AG Grid: fullWidthCellRenderer ${cellRendererName} not found`);
                    }
                    return;
                }
                res.then(callback);
            }

            this.afterRowAttached(rowContainerComp, eRow);
            eRowCallback(eRow);

            this.angular1Compile(eRow);
        });
    }

    private setupDetailRowAutoHeight(eDetailGui: HTMLElement): void {

        if (!this.beans.gridOptionsWrapper.isDetailRowAutoHeight()) { return; }

        const checkRowSizeFunc = () => {
            const clientHeight = eDetailGui.clientHeight;

            // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
            // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
            // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
            // empty detail grid would still have some styling around it giving at least a few pixels.
            if (clientHeight != null && clientHeight > 0) {
                // we do the update in a timeout, to make sure we are not calling from inside the grid
                // doing another update
                const updateRowHeightFunc = () => {
                    this.rowNode.setRowHeight(clientHeight);
                    if (this.beans.clientSideRowModel) {
                        this.beans.clientSideRowModel.onRowHeightChanged();
                    } else if (this.beans.serverSideRowModel) {
                        this.beans.serverSideRowModel.onRowHeightChanged();
                    }
                };
                this.beans.frameworkOverrides.setTimeout(updateRowHeightFunc, 0);
            }
        };

        const resizeObserverDestroyFunc = this.beans.resizeObserverService.observeResize(eDetailGui, checkRowSizeFunc);

        this.fullWidthRowDestroyFuncs.push(resizeObserverDestroyFunc);

        checkRowSizeFunc();
    }

    private angular1Compile(element: Element): void {
        if (!this.scope) { return; }

        this.beans.$compile(element)(this.scope);
    }

    private createFullWidthParams(eRow: HTMLElement, pinned: string | null): any {
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
        const params = {
            rowNode: this.rowNode,
            extraCssClass: extraCssClass,
            rowFocused: this.rowFocused,
            fadeRowIn: this.fadeRowIn,
            rowIsEven: this.rowIsEven,
            rowLevel: this.rowLevel,
            fullWidthRow: this.fullWidthRow,
            firstRowOnPage: this.isFirstRowOnPage(),
            lastRowOnPage: this.isLastRowOnPage(),
            printLayout: this.printLayout,
            expandable: this.rowNode.isExpandable(),
            scope: this.scope
        };
        return this.beans.rowCssClassCalculator.getInitialRowClasses(params);
    }

    private onUiLevelChanged(): void {
        const newLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);
        if (this.rowLevel != newLevel) {
            const classToAdd = 'ag-row-level-' + newLevel;
            const classToRemove = 'ag-row-level-' + this.rowLevel;
            this.eAllRowContainers.forEach((row) => {
                addCssClass(row, classToAdd);
                removeCssClass(row, classToRemove);
            });
        }
        this.rowLevel = newLevel;
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
            this.eAllRowContainers.forEach((row) => addOrRemoveCssClass(row, 'ag-row-first', newFirst));
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.eAllRowContainers.forEach((row) => addOrRemoveCssClass(row, 'ag-row-last', newLast));
        }
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
        this.eAllRowContainers.forEach(row => addOrRemoveCssClass(row, 'ag-row-editing', value));

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
        iterateObject(this.cellComps, (key: any, cellComp: CellComp) => {
            if (!cellComp) { return; }

            callback(cellComp);
        });
    }

    private postProcessClassesFromGridOptions(): void {
        const cssClasses = this.beans.rowCssClassCalculator.processClassesFromGridOptions(this.rowNode, this.scope);
        if (!cssClasses || !cssClasses.length) { return; }

        cssClasses.forEach(classStr => {
            this.eAllRowContainers.forEach(row => addCssClass(row, classStr));
        });
    }

    private postProcessRowClassRules(): void {
        this.beans.rowCssClassCalculator.processRowClassRules(
            this.rowNode, this.scope,
            (className: string) => {
                this.eAllRowContainers.forEach(row => addCssClass(row, className));
            },
            (className: string) => {
                this.eAllRowContainers.forEach(row => removeCssClass(row, className));
            }
        );
    }

    private preProcessStylesFromGridOptions(): string {
        const rowStyles = this.processStylesFromGridOptions();
        return cssStyleObjectToMarkup(rowStyles);
    }

    private postProcessStylesFromGridOptions(): void {
        const rowStyles = this.processStylesFromGridOptions();
        this.eAllRowContainers.forEach(row => addStylesToElement(row, rowStyles));
    }

    private processStylesFromGridOptions(): any {
        // part 1 - rowStyle
        const rowStyle = this.beans.gridOptionsWrapper.getRowStyle();

        if (rowStyle && typeof rowStyle === 'function') {
            console.warn('AG Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            return;
        }

        // part 1 - rowStyleFunc
        const rowStyleFunc = this.beans.gridOptionsWrapper.getRowStyleFunc();
        let rowStyleFuncResult: any;

        if (rowStyleFunc) {
            const params: RowClassParams = {
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex!,
                $scope: this.scope,
                api: this.beans.gridOptionsWrapper.getApi()!,
                columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
                context: this.beans.gridOptionsWrapper.getContext()
            };
            rowStyleFuncResult = rowStyleFunc(params);
        }

        return assign({}, rowStyle, rowStyleFuncResult);
    }

    private createCells(cols: Column[]): { template: string, cellComps: CellComp[]; } {
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
        const selected = this.rowNode.isSelected()!;
        this.eAllRowContainers.forEach((row) => {
            setAriaSelected(row, selected);
            addOrRemoveCssClass(row, 'ag-row-selected', selected);
            this.refreshAriaLabel(row, selected);
        });
    }

    private refreshAriaLabel(node: HTMLElement, selected: boolean): void {
        if (selected && this.beans.gridOptionsWrapper.isSuppressRowDeselection()) {
            node.removeAttribute('aria-label');
            return;
        }

        const translate = this.beans.gridOptionsWrapper.getLocaleTextFunc();
        const label = translate(
            selected ? 'ariaRowDeselect' : 'ariaRowSelect',
            `Press SPACE to ${selected ? 'deselect' : 'select'} this row.`
        );

        setAriaLabel(node, label);
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
            if (exists(this.rowNode.rowTop)) {
                // the row top is updated anyway, however we set it here again
                // to something more reasonable for the animation - ie if the
                // row top is 10000px away, the row will flash out, so this
                // gives it a rounded value, so row animates out more slowly
                const rowTop = this.roundRowTopToBounds(this.rowNode.rowTop);
                this.setRowTop(rowTop);
            } else {
                addCssClass(eRow, 'ag-opacity-zero');
            }
        });

        this.eAllRowContainers.push(eRow);

        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.useAnimationFrameForCreate) {
            this.beans.taskQueue.createTask(
                this.addHoverFunctionality.bind(this, eRow),
                this.rowNode.rowIndex!,
                'createTasksP2'
            );
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
        this.addManagedListener(eRow, 'mouseenter', () => this.rowNode.onMouseEnter());
        this.addManagedListener(eRow, 'mouseleave', () => this.rowNode.onMouseLeave());

        // step 2 - listen for changes on row node (which any eRow can trigger)
        this.addManagedListener(this.rowNode, RowNode.EVENT_MOUSE_ENTER, () => {
            // if hover turned off, we don't add the class. we do this here so that if the application
            // toggles this property mid way, we remove the hover form the last row, but we stop
            // adding hovers from that point onwards.
            if (!this.beans.gridOptionsWrapper.isSuppressRowHoverHighlight()) {
                addCssClass(eRow, 'ag-row-hover');
            }
        });

        this.addManagedListener(this.rowNode, RowNode.EVENT_MOUSE_LEAVE, () => {
            removeCssClass(eRow, 'ag-row-hover');
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
        if (exists(this.rowNode.rowHeight)) {
            const heightPx = `${this.rowNode.rowHeight}px`;

            this.eAllRowContainers.forEach(row => row.style.height = heightPx);
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('AG Grid: Since version 11, event renderedRowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        super.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('AG Grid: Since version 11, event renderedRowRemoved and rowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        super.removeEventListener(eventType, listener);
    }

    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    public destroy(animate = false): void {
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
        super.destroy();
    }

    private destroyContainingCells(): void {
        const cellsToDestroy = Object.keys(this.cellComps);
        this.destroyCells(cellsToDestroy);
    }

    // we clear so that the functions are never executed twice
    public getAndClearDelayedDestroyFunctions(): Function[] {
        const result = this.removeSecondPassFuncs;
        this.removeSecondPassFuncs = [];
        return result;
    }

    private onCellFocusChanged(): void {
        const rowFocused = this.beans.focusController.isRowFocused(this.rowNode.rowIndex!, this.rowNode.rowPinned);

        if (rowFocused !== this.rowFocused) {
            this.eAllRowContainers.forEach(row => addOrRemoveCssClass(row, 'ag-row-focus', rowFocused));
            this.eAllRowContainers.forEach(row => addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused));
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
        this.setRowTop(this.rowNode.rowTop!);
    }

    private onPaginationPixelOffsetChanged(): void {
        // the pixel offset is used when calculating rowTop to set on the row DIV
        this.onTopChanged();
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
        if (exists(pixels)) {
            const afterPaginationPixels = this.applyPaginationOffset(pixels);
            const afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
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

    public getRenderedCellForColumn(column: Column): CellComp | null {
        const cellComp = this.cellComps[column.getColId()];

        if (cellComp) { return cellComp; }

        const spanList = Object.keys(this.cellComps)
            .map(name => this.cellComps[name])
            .filter(cmp => cmp && cmp.getColSpanningList().indexOf(column) !== -1);

        return spanList.length ? spanList[0] : null;
    }

    private onRowIndexChanged(): void {
        // we only bother updating if the rowIndex is present. if it is not present, it means this row
        // is child of a group node, and the group node was closed, it's the only way to have no row index.
        // when this happens, row is about to be de-rendered, so we don't care, rowComp is about to die!
        if (this.rowNode.rowIndex != null) {
            this.onCellFocusChanged();
            this.updateRowIndexes();
        }
    }

    private updateRowIndexes(): void {
        const rowIndexStr = this.rowNode.getRowIndexString();
        const rowIsEven = this.rowNode.rowIndex! % 2 === 0;
        const rowIsEvenChanged = this.rowIsEven !== rowIsEven;
        const headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();

        if (rowIsEvenChanged) {
            this.rowIsEven = rowIsEven;
        }

        this.eAllRowContainers.forEach(eRow => {
            eRow.setAttribute('row-index', rowIndexStr);
            setAriaRowIndex(eRow, headerRowCount + this.rowNode.rowIndex! + 1);

            if (!rowIsEvenChanged) { return; }
            addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
            addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
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
