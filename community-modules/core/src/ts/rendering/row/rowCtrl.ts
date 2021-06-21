import { Beans } from "../beans";
import { CellComp } from "../cell/cellComp";
import { DataChangedEvent, RowHighlightPosition, RowNode } from "../../entities/rowNode";
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

import { ProcessRowParams, RowClassParams } from "../../entities/gridOptions";
import { IFrameworkOverrides } from "../../interfaces/iFrameworkOverrides";
import { Constants } from "../../constants/constants";
import {
    addCssClass,
    addOrRemoveCssClass,
    isElementChildOfClass,
    removeCssClass
} from "../../utils/dom";
import { exists, find } from "../../utils/generic";
import { isStopPropagationForAgGrid } from "../../utils/event";
import { assign } from "../../utils/object";
import { AngularRowUtils } from "./angularRowUtils";
import { CellPosition } from "../../entities/cellPosition";
import { RowPosition } from "../../entities/rowPosition";
import { executeNextVMTurn } from "../../utils/function";
import { RowCssClassCalculatorParams } from "./rowCssClassCalculator";
import { BeanStub } from "../../context/beanStub";
import { convertToMap } from "../../utils/map";
import { RowDragComp } from "./rowDragComp";
import { ICellRendererComp, ICellRendererParams } from "../cellRenderers/iCellRenderer";
import { escapeString } from "../../utils/string";
import { CellCtrl } from "../cell/cellCtrl";

export enum RowType {
    Normal = 'Normal',
    FullWidth = 'FullWidth',
    FullWidthLoading = 'FullWidthLoading',
    FullWidthGroup = 'FullWidthGroup',
    FullWidthDetail = 'FullWidthDetail'
}

export const FullWidthRenderers: Map<RowType, string> = convertToMap([
    [RowType.FullWidthLoading, 'agLoadingCellRenderer'],
    [RowType.FullWidthGroup, 'agGroupRowRenderer'],
    [RowType.FullWidthDetail, 'agDetailCellRenderer']
]);

export const FullWidthKeys: Map<RowType, string> = convertToMap([
    [RowType.FullWidth, 'fullWidthCellRenderer'],
    [RowType.FullWidthLoading, 'loadingCellRenderer'],
    [RowType.FullWidthGroup, 'groupRowRenderer'],
    [RowType.FullWidthDetail, 'detailCellRenderer']
]);

let instanceIdSequence = 0;

export interface IRowComp {
    setDomOrder(domOrder: boolean): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setCellCtrls(cellCtrls: CellCtrl[]): void;
    getFullWidthRowComp(): ICellRendererComp | null | undefined;
    setAriaExpanded(on: boolean): void;
    destroyCells(cellComps: CellComp[]): void;
    forEachCellComp(callback: (comp: CellComp) => void): void;
    setAriaSelected(selected: boolean): void;
    setHeight(height: string): void;
    destroy(): void;
    setTop(top: string): void;
    setTransform(transform: string): void;
    getCellComp(colId: string): CellComp | null;
    getAllCellComps(): CellComp[];
    setRowIndex(rowIndex: string): void;
    setAriaRowIndex(rowIndex: number): void;
    setRowId(rowId: string): void;
    setRowBusinessKey(businessKey: string): void;
    setTabIndex(tabIndex: number): void;
    setAriaLabel(label: string | undefined): void;
    setUserStyles(styles: any): void;
    setRole(role: string): void;
}

interface CompAndElement {
    comp: IRowComp;
    element: HTMLElement;
    pinned: string | null;
}

interface CellCtrls {
    list: CellCtrl[];
    map: {[key: string]: CellCtrl};
}

export class RowCtrl extends BeanStub {

    public static DOM_DATA_KEY_RENDERED_ROW = 'renderedRow';

    private instanceId = instanceIdSequence++;

    private readonly rowNode: RowNode;

    private readonly beans: Beans;

    private rowType: RowType;

    private leftComp: CompAndElement;
    private centerComp: CompAndElement;
    private rightComp: CompAndElement;
    private fullWidthComp: CompAndElement;

    private allComps: CompAndElement[] = [];

    private firstRowOnPage: boolean;
    private lastRowOnPage: boolean;

    private active = true;

    private editingRow: boolean;
    private rowFocused: boolean;

    private centerCellCtrls: CellCtrls = {list: [], map: {}};
    private leftCellCtrls: CellCtrls = {list: [], map: {}};
    private rightCellCtrls: CellCtrls = {list: [], map: {}};

    private fadeRowIn: boolean;
    private slideRowIn: boolean;
    private readonly useAnimationFrameForCreate: boolean;

    private paginationPage: number;

    private parentScope: any;
    private scope: any;

    private lastMouseDownOnDragger = false;

    private rowLevel: number;

    private readonly printLayout: boolean;

    private updateColumnListsPending = false;

    // the top needs to be set into the DOM element when the element is created, not updated afterwards.
    // otherwise the transition would not work, as it would be transitioning from zero (the unset value).
    // for example, suppose a row that is outside the viewport, then user does a filter to remove other rows
    // and this row now appears in the viewport, and the row moves up (ie it was under the viewport and not rendered,
    // but now is in the viewport) then a new RowComp is created, however it should have it's position initialised
    // to below the viewport, so the row will appear to animate up. if we didn't set the initial position at creation
    // time, the row would animate down (ie from position zero).
    private initialTop: string;
    private initialTransform: string;

    constructor(
        parentScope: any,
        rowNode: RowNode,
        beans: Beans,
        animateIn: boolean,
        useAnimationFrameForCreate: boolean,
        printLayout: boolean
    ) {
        super();
        this.parentScope = parentScope;
        this.beans = beans;
        this.rowNode = rowNode;
        this.paginationPage = this.beans.paginationProxy.getCurrentPage();
        this.useAnimationFrameForCreate = useAnimationFrameForCreate;
        this.printLayout = printLayout;

        this.setAnimateFlags(animateIn);

        this.rowFocused = this.beans.focusService.isRowFocused(this.rowNode.rowIndex!, this.rowNode.rowPinned);
        this.setupAngular1Scope();
        this.rowLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);

        this.setRowType();

        this.addListeners();

        this.setInitialRowTop();
    }

    public getBeans(): Beans {
        return this.beans;
    }

    public getInstanceId(): number {
        return this.instanceId;
    }

    public setComp(rowComp: IRowComp, element: HTMLElement, pinned: string | null): void {
        const compAndElement: CompAndElement = {comp: rowComp, element: element, pinned: pinned};
        this.allComps.push(compAndElement);

        if (pinned === Constants.PINNED_LEFT) {
            this.leftComp = compAndElement;
        } else if (pinned === Constants.PINNED_RIGHT) {
            this.rightComp = compAndElement;
        } else if (this.isFullWidth() && !this.beans.gridOptionsWrapper.isEmbedFullWidthRows()) {
            this.fullWidthComp = compAndElement;
        } else {
            this.centerComp = compAndElement;
        }

        const allNormalPresent = this.leftComp != null && this.rightComp != null && this.centerComp != null;
        const fullWidthPresent = this.fullWidthComp != null;
        if (allNormalPresent || fullWidthPresent) {
            this.initialiseRowComps();
        }
    }

    private initialiseRowComps(): void {
        const gow = this.beans.gridOptionsWrapper;

        this.onRowHeightChanged();
        this.updateRowIndexes();
        this.setFocusedClasses();
        this.setStylesFromGridOptions();

        if (gow.isRowSelection() && this.rowNode.selectable) {
            this.onRowSelected();
        }

        this.updateColumnLists(!this.useAnimationFrameForCreate);

        if (this.slideRowIn) {
            executeNextVMTurn(this.onTopChanged.bind(this));
        }
        if (this.fadeRowIn) {
            executeNextVMTurn(() => {
                this.allComps.forEach(rowComp => rowComp.comp.addOrRemoveCssClass('ag-opacity-zero', false));
            });
        }

        const businessKey = this.getRowBusinessKey();
        const rowIdSanitised = escapeString(this.rowNode.id!);
        const businessKeySanitised = escapeString(businessKey!);

        this.allComps.forEach(c => {
            const comp = c.comp;

            comp.setRole('row');

            const initialRowClasses = this.getInitialRowClasses(c.pinned);
            initialRowClasses.forEach(name => comp.addOrRemoveCssClass(name, true));

            if (this.rowNode.group) {
                comp.setAriaExpanded(this.rowNode.expanded == true);
            }

            if (rowIdSanitised != null) {
                comp.setRowId(rowIdSanitised);
            }
            if (businessKeySanitised != null) {
                comp.setRowBusinessKey(businessKeySanitised);
            }

            if (this.isFullWidth()) {
                comp.setTabIndex(-1);
            }

            // DOM DATA
            gow.setDomData(c.element, RowCtrl.DOM_DATA_KEY_RENDERED_ROW, this);
            this.addDestroyFunc(
                () => gow.setDomData(c.element, RowCtrl.DOM_DATA_KEY_RENDERED_ROW, null)
            );

            // adding hover functionality adds listener to this row, so we
            // do it lazily in an animation frame
            if (this.useAnimationFrameForCreate) {
                this.beans.taskQueue.createTask(
                    this.addHoverFunctionality.bind(this, c.element),
                    this.rowNode.rowIndex!,
                    'createTasksP2'
                );
            } else {
                this.addHoverFunctionality(c.element);
            }
        });

        this.executeProcessRowPostCreateFunc();
    }

    public getScope(): any {
        return this.scope;
    }

    public isPrintLayout(): boolean {
        return this.printLayout;
    }

    private setupAngular1Scope(): void {
        const scopeResult = AngularRowUtils.createChildScopeOrNull(this.rowNode, this.parentScope, this.beans.gridOptionsWrapper);
        if (scopeResult) {
            this.scope = scopeResult.scope;
            this.addDestroyFunc(scopeResult.scopeDestroyFunc);
        }
    }

    public getCellForCol(column: Column): HTMLElement | null {
        const cellComp = this.getCellForColumn(column);
        return cellComp ? cellComp.getGui() : null;
    }

    public executeProcessRowPostCreateFunc(): void {
        const func = this.beans.gridOptionsWrapper.getProcessRowPostCreateFunc();
        if (!func) { return; }

        const params: ProcessRowParams = {
            eRow: this.centerComp ? this.centerComp.element : undefined!,
            ePinnedLeftRow: this.leftComp ? this.leftComp.element : undefined!,
            ePinnedRightRow: this.rightComp ? this.rightComp.element : undefined!,
            node: this.rowNode,
            api: this.beans.gridOptionsWrapper.getApi()!,
            rowIndex: this.rowNode.rowIndex!,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            context: this.beans.gridOptionsWrapper.getContext()
        };
        func(params);
    }

    private setRowType(): void {
        const isStub = this.rowNode.stub;
        const isFullWidthCell = this.rowNode.isFullWidthCell();
        const isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;
        const pivotMode = this.beans.columnModel.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        const isGroupRow = !!this.rowNode.group && !this.rowNode.footer;
        const isFullWidthGroup = isGroupRow && this.beans.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);

        if (isStub) {
            this.rowType = RowType.FullWidthLoading;
        } else if (isDetailCell) {
            this.rowType = RowType.FullWidthDetail;
        } else if (isFullWidthCell) {
            this.rowType = RowType.FullWidth;
        } else if (isFullWidthGroup) {
            this.rowType = RowType.FullWidthGroup;
        } else {
            this.rowType = RowType.Normal;
        }
    }

    private updateColumnLists(suppressAnimationFrame = false): void {

        if (this.isFullWidth()) { return; }

        const noAnimation = suppressAnimationFrame
            || this.beans.gridOptionsWrapper.isSuppressAnimationFrame()
            || this.printLayout;

        if (noAnimation) {
            this.updateColumnListsImpl();
            return;
        }

        if (this.updateColumnListsPending) { return; }
        this.beans.taskQueue.createTask(
            () => {
                if (!this.active) { return; }
                this.updateColumnListsImpl();
            },
            this.rowNode.rowIndex!,
            'createTasksP1'
        );
        this.updateColumnListsPending = true;
    }

    private createCellCtrls(prev: CellCtrls, cols: Column[]): CellCtrls {
        const res: CellCtrls = {
            list: [],
            map: {}
        };
        cols.forEach( col => {
            // we use instanceId's rather than colId as it's possible there is a Column with same Id,
            // but it's referring to a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg pivot_0, pivot_1 etc
            const colInstanceId = col.getInstanceId();
            let cellCtrl = prev.map[colInstanceId];
            if (!cellCtrl) {
                cellCtrl = new CellCtrl(col, this.rowNode, this.beans, this);
            }
            res.list.push(cellCtrl);
            res.map[colInstanceId] = cellCtrl;
        });
        prev.list.forEach( prevCellCtrl => {
            const cellCtrlNotInResult = !res.map[prevCellCtrl.getColumn().getInstanceId()];
            if (cellCtrlNotInResult) {
                prevCellCtrl.destroy();
            }
        });

        return res;
    }

    private updateColumnListsImpl(): void {
        this.updateColumnListsPending = false;
        const columnModel = this.beans.columnModel;
        if (this.printLayout) {
            this.centerCellCtrls = this.createCellCtrls(this.centerCellCtrls, columnModel.getAllDisplayedColumns());
            this.leftCellCtrls = {list: [], map: {}};
            this.rightCellCtrls = {list: [], map: {}};
        } else {
            const centerCols = columnModel.getViewportCenterColumnsForRow(this.rowNode);
            this.centerCellCtrls = this.createCellCtrls(this.centerCellCtrls, centerCols);

            const leftCols = columnModel.getDisplayedLeftColumnsForRow(this.rowNode);
            this.leftCellCtrls = this.createCellCtrls(this.centerCellCtrls, leftCols);

            const rightCols = columnModel.getDisplayedRightColumnsForRow(this.rowNode);
            this.rightCellCtrls = this.createCellCtrls(this.centerCellCtrls, rightCols);
        }

        this.allComps.forEach(c => {
            const cellControls = c.pinned === Constants.PINNED_LEFT ? this.leftCellCtrls :
                        c.pinned === Constants.PINNED_RIGHT ? this.rightCellCtrls : this.centerCellCtrls;
            c.comp.setCellCtrls(cellControls.list);
        });
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
        return this.rowType !== RowType.Normal;
    }

    public getRowType(): RowType {
        return this.rowType;
    }

    public refreshFullWidth(): boolean {
        // returns 'true' if refresh succeeded
        const tryRefresh = (compAndElement: CompAndElement, pinned: string | null): boolean => {
            if (!compAndElement) { return true; } // no refresh needed

            const cellComp = compAndElement.comp.getFullWidthRowComp();

            if (!cellComp) { return true; } // no refresh needed

            // no refresh method present, so can't refresh, hard refresh needed
            if (!cellComp.refresh) { return false; }

            const params = this.createFullWidthParams(compAndElement.element, pinned);
            const refreshSucceeded = cellComp.refresh(params);

            return refreshSucceeded;
        };

        const fullWidthSuccess = tryRefresh(this.fullWidthComp, null);
        const centerSuccess = tryRefresh(this.centerComp, null);
        const leftSuccess = tryRefresh(this.leftComp, Constants.PINNED_LEFT);
        const rightSuccess = tryRefresh(this.rightComp, Constants.PINNED_RIGHT);

        const allFullWidthRowsRefreshed = fullWidthSuccess && centerSuccess && leftSuccess && rightSuccess;

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
        this.addManagedListener(eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));

        this.addManagedListener(eventService, Events.EVENT_COLUMN_MOVED, this.onColumnMoved.bind(this));

        this.addListenersForCellComps();
    }

    private onColumnMoved(): void {
        this.updateColumnLists();
    }

    private addListenersForCellComps(): void {

        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, () => {
            this.forEachCellComp(cellCtrl => cellCtrl.onRowIndexChanged());
        });
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, event => {
            this.forEachCellComp(cellCtrl => cellCtrl.onCellChanged(event) );
        });

    }

    private onRowNodeDataChanged(event: DataChangedEvent): void {
        // if this is an update, we want to refresh, as this will allow the user to put in a transition
        // into the cellRenderer refresh method. otherwise this might be completely new data, in which case
        // we will want to completely replace the cells
        this.forEachCellComp(cellCtrl =>
            cellCtrl.refreshCell({
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
        this.setStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    }

    private onRowNodeHighlightChanged(): void {
        const highlighted = this.rowNode.highlighted;

        this.allComps.forEach(c => {
            const aboveOn = highlighted === RowHighlightPosition.Above;
            const belowOn = highlighted === RowHighlightPosition.Below;
            c.comp.addOrRemoveCssClass('ag-row-highlight-above', aboveOn);
            c.comp.addOrRemoveCssClass('ag-row-highlight-below', belowOn);
        });
    }

    private onRowNodeDraggingChanged(): void {
        this.postProcessRowDragging();
    }

    private postProcessRowDragging(): void {
        const dragging = this.rowNode.dragging;
        this.allComps.forEach(c => c.comp.addOrRemoveCssClass('ag-row-dragging', dragging));
    }

    private updateExpandedCss(): void {

        const expandable = this.rowNode.isExpandable();
        const expanded = this.rowNode.expanded == true;

        this.allComps.forEach(c => {
            c.comp.addOrRemoveCssClass('ag-row-group', expandable);
            c.comp.addOrRemoveCssClass('ag-row-group-expanded', expandable && expanded);
            c.comp.addOrRemoveCssClass('ag-row-group-contracted', expandable && !expanded);
            c.comp.setAriaExpanded(expandable && expanded);
        });
    }

    private onDisplayedColumnsChanged(): void {
        // we skip animations for onDisplayedColumnChanged, as otherwise the client could remove columns and
        // then set data, and any old valueGetter's (ie from cols that were removed) would still get called.
        this.updateColumnLists(true);
    }

    private onVirtualColumnsChanged(): void {
        this.updateColumnLists();
    }

    public getRowPosition(): RowPosition {
        return {
            rowPinned: this.rowNode.rowPinned,
            rowIndex: this.rowNode.rowIndex as number
        };
    }

    public onKeyboardNavigate(keyboardEvent: KeyboardEvent) {
        const currentFullWidthComp = find(this.allComps, c => c.element.contains(keyboardEvent.target as HTMLElement));
        const currentFullWidthContainer = currentFullWidthComp ? currentFullWidthComp.element : null;
        const isFullWidthContainerFocused = currentFullWidthContainer === keyboardEvent.target;

        if (!isFullWidthContainerFocused) { return; }

        const node = this.rowNode;
        const lastFocusedCell = this.beans.focusService.getFocusedCell();
        const cellPosition: CellPosition = {
            rowIndex: node.rowIndex!,
            rowPinned: node.rowPinned,
            column: (lastFocusedCell && lastFocusedCell.column) as Column
        };

        this.beans.navigationService.navigateToNextCell(keyboardEvent, keyboardEvent.keyCode, cellPosition, true);
        keyboardEvent.preventDefault();
    }

    public onTabKeyDown(keyboardEvent: KeyboardEvent) {
        if (keyboardEvent.defaultPrevented || isStopPropagationForAgGrid(keyboardEvent)) { return; }
        const currentFullWidthComp = find(this.allComps, c => c.element.contains(keyboardEvent.target as HTMLElement));
        const currentFullWidthContainer = currentFullWidthComp ? currentFullWidthComp.element : null;
        const isFullWidthContainerFocused = currentFullWidthContainer === keyboardEvent.target;
        let nextEl: HTMLElement | null = null;

        if (!isFullWidthContainerFocused) {
            nextEl = this.beans.focusService.findNextFocusableElement(currentFullWidthContainer!, false, keyboardEvent.shiftKey);
        }

        if ((this.isFullWidth() && isFullWidthContainerFocused) || !nextEl) {
            this.beans.navigationService.onTabKeyDown(this, keyboardEvent);
        }
    }

    public onFullWidthRowFocused(event: CellFocusedEvent) {
        const node = this.rowNode;
        const isFocused = this.isFullWidth() && event.rowIndex === node.rowIndex && event.rowPinned == node.rowPinned;

        const element = this.fullWidthComp ? this.fullWidthComp.element : this.centerComp.element;

        addOrRemoveCssClass(element, 'ag-full-width-focus', isFocused);
        if (isFocused) {
            // we don't scroll normal rows into view when we focus them, so we don't want
            // to scroll Full Width rows either.
            element.focus({preventScroll: true});
        }
    }

    public refreshCell(cellCtrl: CellCtrl) {
        this.centerCellCtrls = this.removeCellCtrl(this.centerCellCtrls, cellCtrl);
        this.leftCellCtrls = this.removeCellCtrl(this.leftCellCtrls, cellCtrl);
        this.rightCellCtrls = this.removeCellCtrl(this.rightCellCtrls, cellCtrl);
        this.updateColumnLists();
    }

    private removeCellCtrl(prev: CellCtrls, cellCtrlToRemove: CellCtrl): CellCtrls {
        const res: CellCtrls = {
            list: [],
            map: {}
        };
        prev.list.forEach( cellCtrl => {
            if (cellCtrl===cellCtrlToRemove) { return; }
            res.list.push(cellCtrl);
            res.map[cellCtrl.getInstanceId()] = cellCtrl;
        });
        return res;
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick': this.onRowDblClick(mouseEvent); break;
            case 'click': this.onRowClick(mouseEvent); break;
            case 'mousedown': this.onRowMouseDown(mouseEvent); break;
        }
    }

    public createRowEvent(type: string, domEvent?: Event): RowEvent {
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
        const columnModel = this.beans.columnModel;

        this.beans.focusService.setFocusedCell(
            node.rowIndex!,
            columnModel.getAllDisplayedColumns()[0],
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

    public setupDetailRowAutoHeight(eDetailGui: HTMLElement): void {

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

        this.addDestroyFunc(resizeObserverDestroyFunc);

        checkRowSizeFunc();
    }

    public createFullWidthParams(eRow: HTMLElement, pinned: string | null): ICellRendererParams {
        const params = {
            fullWidth: true,
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
            valueFormatted: this.rowNode.key,
            $scope: this.scope ? this.scope : this.parentScope,
            $compile: this.beans.$compile,
            rowIndex: this.rowNode.rowIndex!,
            api: this.beans.gridOptionsWrapper.getApi()!,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            context: this.beans.gridOptionsWrapper.getContext(),
            // these need to be taken out, as part of 'afterAttached' now
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this),
            registerRowDragger: (rowDraggerElement, dragStartPixels, value) => this.addFullWidthRowDragging(rowDraggerElement, dragStartPixels, value)
        } as ICellRendererParams;

        return params;
    }

    private addFullWidthRowDragging(
        rowDraggerElement?: HTMLElement,
        dragStartPixels?: number,
        value: string = ''
    ): void {
        if (!this.isFullWidth()) { return; }

        const rowDragComp = new RowDragComp(() => value, this.rowNode, undefined, rowDraggerElement, dragStartPixels);
        this.createManagedBean(rowDragComp, this.beans.context);
    }

    private onUiLevelChanged(): void {
        const newLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);
        if (this.rowLevel != newLevel) {
            const classToAdd = 'ag-row-level-' + newLevel;
            const classToRemove = 'ag-row-level-' + this.rowLevel;
            this.allComps.forEach(c => {
                c.comp.addOrRemoveCssClass(classToAdd, true);
                c.comp.addOrRemoveCssClass(classToRemove, false);
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
            this.allComps.forEach(c => c.comp.addOrRemoveCssClass('ag-row-first', newFirst));
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.allComps.forEach(c => c.comp.addOrRemoveCssClass('ag-row-last', newLast));
        }
    }

    public stopEditing(cancel = false): void {
        this.forEachCellComp(cellCtrl => cellCtrl.stopEditing(cancel) );

        if (!this.editingRow) { return; }

        if (!cancel) {
            const event: RowValueChangedEvent = this.createRowEvent(Events.EVENT_ROW_VALUE_CHANGED);
            this.beans.eventService.dispatchEvent(event);
        }
        this.setEditingRow(false);
    }

    public setInlineEditingCss(editing: boolean): void {
        this.allComps.forEach( c => {
            c.comp.addOrRemoveCssClass("ag-row-inline-editing", editing);
            c.comp.addOrRemoveCssClass("ag-row-not-inline-editing", !editing);
        });
    }

    private setEditingRow(value: boolean): void {
        this.editingRow = value;
        this.allComps.forEach(c => c.comp.addOrRemoveCssClass('ag-row-editing', value));

        const event: RowEvent = value ?
            this.createRowEvent(Events.EVENT_ROW_EDITING_STARTED) as RowEditingStartedEvent
            : this.createRowEvent(Events.EVENT_ROW_EDITING_STOPPED) as RowEditingStoppedEvent;

        this.beans.eventService.dispatchEvent(event);
    }

    public startRowEditing(keyPress: number | null = null, charPress: string | null = null, sourceRenderedCell: CellCtrl | null = null): void {
        // don't do it if already editing
        if (this.editingRow) { return; }

        this.forEachCellComp(cellCtrl => {
            const cellStartedEdit = cellCtrl === sourceRenderedCell;
            if (cellStartedEdit) {
                cellCtrl.startEditing(keyPress, charPress, cellStartedEdit);
            } else {
                cellCtrl.startEditing(null, null, cellStartedEdit);
            }
        });
        this.setEditingRow(true);
    }

    public forEachCellComp(callback: (cellCtrl: CellCtrl) => void): void {
        const allCellCtrls = [...this.centerCellCtrls.list, ...this.leftCellCtrls.list, ...this.rightCellCtrls.list];
        allCellCtrls.forEach(callback);
    }

    private postProcessClassesFromGridOptions(): void {
        const cssClasses = this.beans.rowCssClassCalculator.processClassesFromGridOptions(this.rowNode, this.scope);
        if (!cssClasses || !cssClasses.length) { return; }

        cssClasses.forEach(classStr => {
            this.allComps.forEach(c => c.comp.addOrRemoveCssClass(classStr, true));
        });
    }

    private postProcessRowClassRules(): void {
        this.beans.rowCssClassCalculator.processRowClassRules(
            this.rowNode, this.scope,
            (className: string) => {
                this.allComps.forEach(c => c.comp.addOrRemoveCssClass(className, true));
            },
            (className: string) => {
                this.allComps.forEach(c => c.comp.addOrRemoveCssClass(className, false));
            }
        );
    }

    private setStylesFromGridOptions(): void {
        const rowStyles = this.processStylesFromGridOptions();
        this.allComps.forEach(c => c.comp.setUserStyles(rowStyles));
    }

    public getRowBusinessKey(): string | undefined {
        const businessKeyForNodeFunc = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc();
        if (typeof businessKeyForNodeFunc !== 'function') { return; }

        return businessKeyForNodeFunc(this.rowNode);
    }

    public getInitialRowClasses(pinned: string | null): string[] {
        const params: RowCssClassCalculatorParams = {
            rowNode: this.rowNode,
            rowFocused: this.rowFocused,
            fadeRowIn: this.fadeRowIn,
            rowIsEven: this.rowNode.rowIndex! % 2 === 0,
            rowLevel: this.rowLevel,
            fullWidthRow: this.isFullWidth(),
            firstRowOnPage: this.isFirstRowOnPage(),
            lastRowOnPage: this.isLastRowOnPage(),
            printLayout: this.printLayout,
            expandable: this.rowNode.isExpandable(),
            scope: this.scope,
            pinned: pinned
        };
        return this.beans.rowCssClassCalculator.getInitialRowClasses(params);
    }

    public processStylesFromGridOptions(): any {
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

    private onRowSelected(): void {
        const selected = this.rowNode.isSelected()!;
        this.allComps.forEach(c => {
            c.comp.setAriaSelected(selected);
            c.comp.addOrRemoveCssClass('ag-row-selected', selected);
            c.comp.setAriaLabel(this.createAriaLabel());
        });
    }

    private createAriaLabel(): string | undefined {
        const selected = this.rowNode.isSelected()!;
        if (selected && this.beans.gridOptionsWrapper.isSuppressRowDeselection()) {
            return undefined;
        }

        const translate = this.beans.gridOptionsWrapper.getLocaleTextFunc();
        const label = translate(
            selected ? 'ariaRowDeselect' : 'ariaRowSelect',
            `Press SPACE to ${selected ? 'deselect' : 'select'} this row.`
        );

        return label;
    }

    public isUseAnimationFrameForCreate(): boolean {
        return this.useAnimationFrameForCreate;
    }

    public addHoverFunctionality(eRow: HTMLElement): void {
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
    public roundRowTopToBounds(rowTop: number): number {
        const gridBodyCon = this.beans.controllersService.getGridBodyController();
        const range = gridBodyCon.getScrollFeature().getVScrollPosition();
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

            this.allComps.forEach(c => c.comp.setHeight(heightPx));
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
    public destroyFirstPass(): void {
        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        this.setupRemoveAnimation();

        const event: VirtualRowRemovedEvent = this.createRowEvent(Events.EVENT_VIRTUAL_ROW_REMOVED);

        this.dispatchEvent(event);
        this.beans.eventService.dispatchEvent(event);
        super.destroy();
    }

    private setupRemoveAnimation(): void {
        const rowStillVisibleJustNotInViewport = this.rowNode.rowTop != null;
        if (rowStillVisibleJustNotInViewport) {
            // if the row is not rendered, but in viewport, it means it has moved,
            // so we animate the row out. if the new location is very far away,
            // the animation will be so fast the row will look like it's just disappeared,
            // so instead we animate to a position just outside the viewport.
            const rowTop = this.roundRowTopToBounds(this.rowNode.rowTop!);
            this.setRowTop(rowTop);
        } else {
            this.allComps.forEach(c => c.comp.addOrRemoveCssClass('ag-opacity-zero', true));
        }
    }

    public destroySecondPass(): void {
        this.allComps.forEach(c => c.comp.destroy());
        this.allComps.length = 0;

        const destroyCellCtrls = (ctrls: CellCtrls): CellCtrls => {
            ctrls.list.forEach( c => c.destroy() );
            return {list: [], map: {}};
        };

        this.centerCellCtrls = destroyCellCtrls(this.centerCellCtrls);
        this.leftCellCtrls = destroyCellCtrls(this.leftCellCtrls);
        this.rightCellCtrls = destroyCellCtrls(this.rightCellCtrls);
    }

    private setFocusedClasses(): void {
        this.allComps.forEach(c => {
            c.comp.addOrRemoveCssClass('ag-row-focus', this.rowFocused);
            c.comp.addOrRemoveCssClass('ag-row-no-focus', !this.rowFocused);
        });
    }

    private onCellFocusChanged(): void {
        const rowFocused = this.beans.focusService.isRowFocused(this.rowNode.rowIndex!, this.rowNode.rowPinned);

        if (rowFocused !== this.rowFocused) {
            this.rowFocused = rowFocused;
            this.setFocusedClasses();
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

    public setRowTop(pixels: number): void {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) { return; }

        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (exists(pixels)) {
            const afterPaginationPixels = this.applyPaginationOffset(pixels);
            const afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.rowContainerHeightService.getRealPixelPosition(afterPaginationPixels);
            const topPx = `${afterScalingPixels}px`;
            this.setRowTopStyle(topPx);
        }
    }

    public getInitialRowTop(): string | undefined {
        return this.initialTop;
    }

    public getInitialTransform(): string | undefined {
        return this.initialTransform;
    }

    private setInitialRowTop() {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) { return ''; }

        // if sliding in, we take the old row top. otherwise we just set the current row top.
        const pixels = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop!) : this.rowNode.rowTop;
        const afterPaginationPixels = this.applyPaginationOffset(pixels!);
        // we don't apply scaling if row is pinned
        const afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.rowContainerHeightService.getRealPixelPosition(afterPaginationPixels);

        const res = afterScalingPixels + 'px';

        const suppressRowTransform = this.beans.gridOptionsWrapper.isSuppressRowTransform();
        if (suppressRowTransform) {
            this.initialTop = res;
        } else {
            this.initialTransform = `translateY(${res})`;
        }
    }

    private setRowTopStyle(topPx: string): void {
        const suppressRowTransform = this.beans.gridOptionsWrapper.isSuppressRowTransform();
        this.allComps.forEach(
            c => suppressRowTransform ?
                c.comp.setTop(topPx) :
                c.comp.setTransform(`translateY(${topPx})`)
        );
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public getCellForColumn(column: Column): CellComp | null {
        const cellComps = this.allComps.map(c => c.comp.getCellComp(column.getColId()));
        let cellComp = find(cellComps, c => !!c);

        if (cellComp) { return cellComp; }

        const spannedCellComps = this.allComps.map(c => {
            const allCellComps = c.comp.getAllCellComps();
            const compsWithThisCol = allCellComps
                .filter(cmp => cmp.getCtrl().getColSpanningList().indexOf(column) >= 0);
            return compsWithThisCol.length >= 0 ? compsWithThisCol[0] : null;
        });
        cellComp = find(spannedCellComps, c => !!c);

        return cellComp || null;
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
        const headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
        const rowIsEven = this.rowNode.rowIndex! % 2 === 0;

        this.allComps.forEach(c => {
            c.comp.setRowIndex(rowIndexStr);
            c.comp.setAriaRowIndex(headerRowCount + this.rowNode.rowIndex! + 1);
            c.comp.addOrRemoveCssClass('ag-row-even', rowIsEven);
            c.comp.addOrRemoveCssClass('ag-row-odd', !rowIsEven);
        });
    }

    // returns the pinned left container, either the normal one, or the embedded full with one if exists
    public getPinnedLeftRowElement(): HTMLElement {
        return this.leftComp ? this.leftComp.element : undefined!;
    }

    // returns the pinned right container, either the normal one, or the embedded full with one if exists
    public getPinnedRightRowElement(): HTMLElement {
        return this.rightComp ? this.rightComp.element : undefined!;
    }

    // returns the body container, either the normal one, or the embedded full with one if exists
    public getBodyRowElement(): HTMLElement {
        return this.centerComp ? this.centerComp.element : undefined!;
    }

    // returns the full width container
    public getFullWidthRowElement(): HTMLElement {
        return this.fullWidthComp ? this.fullWidthComp.element : undefined!;
    }

}
