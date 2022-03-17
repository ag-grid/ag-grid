import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { Constants } from "../../constants/constants";
import { BeanStub } from "../../context/beanStub";
import { CellPosition } from "../../entities/cellPosition";
import { Column } from "../../entities/column";
import { ProcessRowParams, RowClassParams } from "../../entities/gridOptions";
import { DataChangedEvent, RowHighlightPosition, RowNode } from "../../entities/rowNode";
import { RowPosition } from "../../entities/rowPosition";
import { CellFocusedEvent, Events, RowClickedEvent, RowDoubleClickedEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowEvent, RowValueChangedEvent, VirtualRowRemovedEvent } from "../../events";
import { IFrameworkOverrides } from "../../interfaces/iFrameworkOverrides";
import { ModuleNames } from "../../modules/moduleNames";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { isElementChildOfClass } from "../../utils/dom";
import { isStopPropagationForAgGrid } from "../../utils/event";
import { doOnce, executeNextVMTurn } from "../../utils/function";
import { exists, makeNull } from "../../utils/generic";
import { escapeString } from "../../utils/string";
import { Beans } from "../beans";
import { CellCtrl } from "../cell/cellCtrl";
import { ICellRenderer, ICellRendererParams } from "../cellRenderers/iCellRenderer";
import { AngularRowUtils } from "./angularRowUtils";
import { RowCssClassCalculatorParams } from "./rowCssClassCalculator";
import { RowDragComp } from "./rowDragComp";
import { RowContainerType } from "../../gridBodyComp/rowContainer/rowContainerCtrl";
import { setAriaExpanded, setAriaSelected, setAriaLabel, setAriaRowIndex } from "../../utils/aria";

export enum RowType {
    Normal = 'Normal',
    FullWidth = 'FullWidth',
    FullWidthLoading = 'FullWidthLoading',
    FullWidthGroup = 'FullWidthGroup',
    FullWidthDetail = 'FullWidthDetail'
}

let instanceIdSequence = 0;

export interface IRowComp {
    setDomOrder(domOrder: boolean): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setCellCtrls(cellCtrls: CellCtrl[]): void;
    showFullWidth(compDetails: UserCompDetails): void;
    getFullWidthCellRenderer(): ICellRenderer | null | undefined;
    setTop(top: string): void;
    setTransform(transform: string): void;
    setRowIndex(rowIndex: string): void;
    setRowId(rowId: string): void;
    setRowBusinessKey(businessKey: string): void;
    setTabIndex(tabIndex: number): void;
    setUserStyles(styles: any): void;
    setRole(role: string): void;
}

interface RowGui {
    rowComp: IRowComp;
    element: HTMLElement;
    containerType: RowContainerType;
}

interface CellCtrlListAndMap {
    list: CellCtrl[];
    map: {[key: string]: CellCtrl};
}

export class RowCtrl extends BeanStub {

    public static DOM_DATA_KEY_ROW_CTRL = 'renderedRow';

    private instanceId: string;

    private readonly rowNode: RowNode;

    private readonly beans: Beans;

    private rowType: RowType;

    private leftGui: RowGui;
    private centerGui: RowGui;
    private rightGui: RowGui;
    private fullWidthGui: RowGui;

    private allRowGuis: RowGui[] = [];

    private firstRowOnPage: boolean;
    private lastRowOnPage: boolean;

    private active = true;

    private editingRow: boolean;
    private rowFocused: boolean;

    private centerCellCtrls: CellCtrlListAndMap = {list: [], map: {}};
    private leftCellCtrls: CellCtrlListAndMap = {list: [], map: {}};
    private rightCellCtrls: CellCtrlListAndMap = {list: [], map: {}};

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

        this.instanceId = rowNode.id + '-' + instanceIdSequence++;

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

    public getInstanceId(): string {
        return this.instanceId;
    }

    public setComp(rowComp: IRowComp, element: HTMLElement, containerType: RowContainerType): void {
        const gui: RowGui = {rowComp, element, containerType};
        this.allRowGuis.push(gui);

        if (containerType === RowContainerType.LEFT) {
            this.leftGui = gui;
        } else if (containerType === RowContainerType.RIGHT) {
            this.rightGui = gui;
        } else if (containerType === RowContainerType.FULL_WIDTH) {
            this.fullWidthGui = gui;
        } else {
            this.centerGui = gui;
        }

        const allNormalPresent = this.leftGui != null && this.rightGui != null && this.centerGui != null;
        const fullWidthPresent = this.fullWidthGui != null;
        if (allNormalPresent || fullWidthPresent) {
            this.initialiseRowComps();
        }
    }

    public isCacheable(): boolean {
        return this.rowType === RowType.FullWidthDetail
                && this.beans.gridOptionsWrapper.isKeepDetailRows();
    }

    public setCached(cached: boolean): void {
        const displayValue = cached ? 'none' : '';
        this.allRowGuis.forEach(rg => rg.element.style.display = displayValue);
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
                this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass('ag-opacity-zero', false));
            });
        }

        const businessKey = this.getRowBusinessKey();
        const rowIdSanitised = escapeString(this.rowNode.id!);
        const businessKeySanitised = escapeString(businessKey!);

        this.allRowGuis.forEach(gui => {
            const comp = gui.rowComp;

            comp.setRole('row');

            const initialRowClasses = this.getInitialRowClasses(gui.containerType);
            initialRowClasses.forEach(name => comp.addOrRemoveCssClass(name, true));

            if (this.rowNode.group) {
                setAriaExpanded(gui.element, this.rowNode.expanded == true);
            }

            if (rowIdSanitised != null) {
                comp.setRowId(rowIdSanitised);
            }
            if (businessKeySanitised != null) {
                comp.setRowBusinessKey(businessKeySanitised);
            }

            if (this.isFullWidth() && !this.beans.gridOptionsWrapper.isSuppressCellFocus()) {
                comp.setTabIndex(-1);
            }

            // DOM DATA
            gow.setDomData(gui.element, RowCtrl.DOM_DATA_KEY_ROW_CTRL, this);
            this.addDestroyFunc(
                () => gow.setDomData(gui.element, RowCtrl.DOM_DATA_KEY_ROW_CTRL, null)
            );

            // adding hover functionality adds listener to this row, so we
            // do it lazily in an animation frame
            if (this.useAnimationFrameForCreate) {
                this.beans.animationFrameService.createTask(
                    this.addHoverFunctionality.bind(this, gui.element),
                    this.rowNode.rowIndex!,
                    'createTasksP2'
                );
            } else {
                this.addHoverFunctionality(gui.element);
            }

            if (this.isFullWidth()) {
                this.setupFullWidth(gui);
            }

            if (gow.isRowDragEntireRow()) {
                this.addRowDraggerToRow(gui);
            }

            if (this.useAnimationFrameForCreate) {
                // the height animation we only want active after the row is alive for 1 second.
                // this stops the row animation working when rows are initially crated. otherwise
                // auto-height rows get inserted into the dom and resized immediately, which gives
                // very bad UX (eg 10 rows get inserted, then all 10 expand, look particularly bad
                // when scrolling). so this makes sure when rows are shown for the first time, they
                // are resized immediately without animation.
                this.beans.animationFrameService.addDestroyTask(() => {
                    if (!this.isAlive()) { return; }
                    gui.rowComp.addOrRemoveCssClass('ag-after-created', true);
                });
            }
        });

        this.executeProcessRowPostCreateFunc();
    }

    private addRowDraggerToRow(gui: RowGui) {
        const gow = this.beans.gridOptionsWrapper;

        if (gow.isEnableRangeSelection()) {
            doOnce(() => {
                console.warn('AG Grid: Setting `rowDragEntireRow: true` in the gridOptions doesn\'t work with `enableRangeSelection: true`');
            }, 'rowDragAndRangeSelectionEnabled');
            return;
        }

        const rowDragComp = new RowDragComp(() => '1 row', this.rowNode, undefined, gui.element, undefined, true);
        this.createManagedBean(rowDragComp, this.beans.context);
    }

    private setupFullWidth(gui: RowGui): void {

        const pinned = this.getPinnedForContainer(gui.containerType);
        const params = this.createFullWidthParams(gui.element, pinned);

        const masterDetailModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.MasterDetailModule);
        if (this.rowType==RowType.FullWidthDetail && !masterDetailModuleLoaded) {
            if (ModuleRegistry.isPackageBased()) {
                console.warn(`AG Grid: cell renderer 'agDetailCellRenderer' (for master detail) not found. Can only be used with ag-grid-enterprise package.`);
            } else {
                console.warn(`AG Grid: cell renderer 'agDetailCellRenderer' (for master detail) not found. Can only be used with AG Grid Enterprise Module ${ModuleNames.MasterDetailModule}`);
            }
            return;
        }

        let compDetails: UserCompDetails;
        switch(this.rowType) {
            case RowType.FullWidthDetail:
                compDetails = this.beans.userComponentFactory.getFullWidthDetailCellRendererDetails(params);
                break;
            case RowType.FullWidthGroup:
                compDetails = this.beans.userComponentFactory.getFullWidthGroupCellRendererDetails(params);
                break;
            case RowType.FullWidthLoading:
                compDetails = this.beans.userComponentFactory.getFullWidthLoadingCellRendererDetails(params);
                break;                
            default:
                compDetails = this.beans.userComponentFactory.getFullWidthCellRendererDetails(params);
                break;
        }

        gui.rowComp.showFullWidth(compDetails);
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

    // use by autoWidthCalculator, as it clones the elements
    public getCellElement(column: Column): HTMLElement | null {
        const cellCtrl = this.getCellCtrl(column);
        return cellCtrl ? cellCtrl.getGui() : null;
    }

    public executeProcessRowPostCreateFunc(): void {
        const func = this.beans.gridOptionsWrapper.getProcessRowPostCreateFunc();
        if (!func) { return; }

        const params: ProcessRowParams = {
            eRow: this.centerGui ? this.centerGui.element : undefined!,
            ePinnedLeftRow: this.leftGui ? this.leftGui.element : undefined!,
            ePinnedRightRow: this.rightGui ? this.rightGui.element : undefined!,
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
        this.beans.animationFrameService.createTask(
            () => {
                if (!this.active) { return; }
                this.updateColumnListsImpl();
            },
            this.rowNode.rowIndex!,
            'createTasksP1'
        );
        this.updateColumnListsPending = true;
    }

    private createCellCtrls(prev: CellCtrlListAndMap, cols: Column[], pinned: string | null = null): CellCtrlListAndMap {
        const res: CellCtrlListAndMap = {
            list: [],
            map: {}
        };

        const addCell = (colInstanceId: number, cellCtrl: CellCtrl) => {
            res.list.push(cellCtrl);
            res.map[colInstanceId] = cellCtrl;
        };

        cols.forEach(col => {
            // we use instanceId's rather than colId as it's possible there is a Column with same Id,
            // but it's referring to a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg pivot_0, pivot_1 etc
            const colInstanceId = col.getInstanceId();
            let cellCtrl = prev.map[colInstanceId];
            if (!cellCtrl) {
                cellCtrl = new CellCtrl(col, this.rowNode, this.beans, this);
            }
            addCell(colInstanceId, cellCtrl);
        });

        prev.list.forEach(prevCellCtrl => {
            const cellInResult = res.map[prevCellCtrl.getColumn().getInstanceId()] != null;
            if (cellInResult) { return; }

            const keepCell = !this.isCellEligibleToBeRemoved(prevCellCtrl, pinned);
            if (keepCell) {
                addCell(prevCellCtrl.getColumn().getInstanceId(), prevCellCtrl);
                return;
            }

            prevCellCtrl.destroy();
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
            this.leftCellCtrls = this.createCellCtrls(this.leftCellCtrls, leftCols, Constants.PINNED_LEFT);

            const rightCols = columnModel.getDisplayedRightColumnsForRow(this.rowNode);
            this.rightCellCtrls = this.createCellCtrls(this.rightCellCtrls, rightCols, Constants.PINNED_RIGHT);
        }

        this.allRowGuis.forEach(item => {
            const cellControls = item.containerType === RowContainerType.LEFT ? this.leftCellCtrls :
                                 item.containerType === RowContainerType.RIGHT ? this.rightCellCtrls : this.centerCellCtrls;
            item.rowComp.setCellCtrls(cellControls.list);
        });
    }

    private isCellEligibleToBeRemoved(cellCtrl: CellCtrl, nextContainerPinned: string | null): boolean {
        const REMOVE_CELL = true;
        const KEEP_CELL = false;

        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        const column = cellCtrl.getColumn();
        if (column.getPinned() != nextContainerPinned) { return REMOVE_CELL; }

        // we want to try and keep editing and focused cells
        const editing = cellCtrl.isEditing();
        const focused = this.beans.focusService.isCellFocused(cellCtrl.getCellPosition());

        const mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            const column = cellCtrl.getColumn();
            const displayedColumns = this.beans.columnModel.getAllDisplayedColumns();
            const cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;
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
        const tryRefresh = (gui: RowGui, pinned: string | null): boolean => {
            if (!gui) { return true; } // no refresh needed

            const cellRenderer = gui.rowComp.getFullWidthCellRenderer();

            // no cell renderer, either means comp not yet ready, or comp ready but now reference
            // to it (happens in react when comp is stateless). if comp not ready, we don't need to
            // refresh, however we don't know which one, so we refresh to cover the case where it's
            // react comp without reference so need to force a refresh
            if (!cellRenderer) { return false; }

            // no refresh method present, so can't refresh, hard refresh needed
            if (!cellRenderer.refresh) { return false; }

            const params = this.createFullWidthParams(gui.element, pinned);
            const refreshSucceeded = cellRenderer.refresh(params);

            return refreshSucceeded;
        };

        const fullWidthSuccess = tryRefresh(this.fullWidthGui, null);
        const centerSuccess = tryRefresh(this.centerGui, null);
        const leftSuccess = tryRefresh(this.leftGui, Constants.PINNED_LEFT);
        const rightSuccess = tryRefresh(this.rightGui, Constants.PINNED_RIGHT);

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
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onRowIndexChanged());
        });
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, event => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onCellChanged(event));
        });

    }

    private onRowNodeDataChanged(event: DataChangedEvent): void {
        // if this is an update, we want to refresh, as this will allow the user to put in a transition
        // into the cellRenderer refresh method. otherwise this might be completely new data, in which case
        // we will want to completely replace the cells
        this.getAllCellCtrls().forEach(cellCtrl =>
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

        this.allRowGuis.forEach(gui => {
            const aboveOn = highlighted === RowHighlightPosition.Above;
            const belowOn = highlighted === RowHighlightPosition.Below;
            gui.rowComp.addOrRemoveCssClass('ag-row-highlight-above', aboveOn);
            gui.rowComp.addOrRemoveCssClass('ag-row-highlight-below', belowOn);
        });
    }

    private onRowNodeDraggingChanged(): void {
        this.postProcessRowDragging();
    }

    private postProcessRowDragging(): void {
        const dragging = this.rowNode.dragging;
        this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass('ag-row-dragging', dragging));
    }

    private updateExpandedCss(): void {

        const expandable = this.rowNode.isExpandable();
        const expanded = this.rowNode.expanded == true;

        this.allRowGuis.forEach(gui => {
            gui.rowComp.addOrRemoveCssClass('ag-row-group', expandable);
            gui.rowComp.addOrRemoveCssClass('ag-row-group-expanded', expandable && expanded);
            gui.rowComp.addOrRemoveCssClass('ag-row-group-contracted', expandable && !expanded);
            setAriaExpanded(gui.element, expandable && expanded);
        });
    }

    private onDisplayedColumnsChanged(): void {
        // we skip animations for onDisplayedColumnChanged, as otherwise the client could remove columns and
        // then set data, and any old valueGetter's (ie from cols that were removed) would still get called.
        this.updateColumnLists(true);

        if (this.beans.columnModel.wasAutoRowHeightEverActive()) {
            this.rowNode.checkAutoHeights();
        }
    }

    private onVirtualColumnsChanged(): void {
        this.updateColumnLists();
    }

    public getRowPosition(): RowPosition {
        return {
            rowPinned: makeNull(this.rowNode.rowPinned),
            rowIndex: this.rowNode.rowIndex as number
        };
    }

    public onKeyboardNavigate(keyboardEvent: KeyboardEvent) {
        const currentFullWidthComp = this.allRowGuis.find(c => c.element.contains(keyboardEvent.target as HTMLElement));
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

        this.beans.navigationService.navigateToNextCell(keyboardEvent, keyboardEvent.key, cellPosition, true);
        keyboardEvent.preventDefault();
    }

    public onTabKeyDown(keyboardEvent: KeyboardEvent) {
        if (keyboardEvent.defaultPrevented || isStopPropagationForAgGrid(keyboardEvent)) { return; }
        const currentFullWidthComp = this.allRowGuis.find(c => c.element.contains(keyboardEvent.target as HTMLElement));
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

        const element = this.fullWidthGui ? this.fullWidthGui.element : this.centerGui?.element;
        if (!element) { return; } // can happen with react ui, comp not yet ready

        element.classList.toggle('ag-full-width-focus', isFocused);
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

    private removeCellCtrl(prev: CellCtrlListAndMap, cellCtrlToRemove: CellCtrl): CellCtrlListAndMap {
        const res: CellCtrlListAndMap = {
            list: [],
            map: {}
        };
        prev.list.forEach(cellCtrl => {
            if (cellCtrl === cellCtrlToRemove) { return; }
            res.list.push(cellCtrl);
            res.map[cellCtrl.getInstanceId()] = cellCtrl;
        });
        return res;
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick': this.onRowDblClick(mouseEvent); break;
            case 'click': this.onRowClick(mouseEvent); break;
            case 'touchstart':
            case 'mousedown':
                this.onRowMouseDown(mouseEvent);
                break;
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

        if (this.rowType !== RowType.FullWidthDetail) { return; }

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
            registerRowDragger: (rowDraggerElement, dragStartPixels, value, suppressVisibilityChange) => this.addFullWidthRowDragging(rowDraggerElement, dragStartPixels, value, suppressVisibilityChange)
        } as ICellRendererParams;

        return params;
    }

    private addFullWidthRowDragging(
        rowDraggerElement?: HTMLElement,
        dragStartPixels?: number,
        value: string = '',
        suppressVisibilityChange?: boolean
    ): void {
        if (!this.isFullWidth()) { return; }

        const rowDragComp = new RowDragComp(() => value, this.rowNode, undefined, rowDraggerElement, dragStartPixels, suppressVisibilityChange);
        this.createManagedBean(rowDragComp, this.beans.context);
    }

    private onUiLevelChanged(): void {
        const newLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);
        if (this.rowLevel != newLevel) {
            const classToAdd = 'ag-row-level-' + newLevel;
            const classToRemove = 'ag-row-level-' + this.rowLevel;
            this.allRowGuis.forEach(gui => {
                gui.rowComp.addOrRemoveCssClass(classToAdd, true);
                gui.rowComp.addOrRemoveCssClass(classToRemove, false);
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
        this.refreshFirstAndLastRowStyles();
    }

    private refreshFirstAndLastRowStyles(): void {
        const newFirst = this.isFirstRowOnPage();
        const newLast = this.isLastRowOnPage();

        if (this.firstRowOnPage !== newFirst) {
            this.firstRowOnPage = newFirst;
            this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass('ag-row-first', newFirst));
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass('ag-row-last', newLast));
        }
    }

    public stopEditing(cancel = false): void {
        const cellEdits = this.getAllCellCtrls().map(cellCtrl => cellCtrl.stopEditing(cancel));

        if (!this.editingRow) { return; }

        if (!cancel && cellEdits.some(edit => edit)) {
            const event: RowValueChangedEvent = this.createRowEvent(Events.EVENT_ROW_VALUE_CHANGED);
            this.beans.eventService.dispatchEvent(event);
        }
        this.setEditingRow(false);
    }

    public setInlineEditingCss(editing: boolean): void {
        this.allRowGuis.forEach(gui => {
            gui.rowComp.addOrRemoveCssClass("ag-row-inline-editing", editing);
            gui.rowComp.addOrRemoveCssClass("ag-row-not-inline-editing", !editing);
        });
    }

    private setEditingRow(value: boolean): void {
        this.editingRow = value;
        this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass('ag-row-editing', value));

        const event: RowEvent = value ?
            this.createRowEvent(Events.EVENT_ROW_EDITING_STARTED) as RowEditingStartedEvent
            : this.createRowEvent(Events.EVENT_ROW_EDITING_STOPPED) as RowEditingStoppedEvent;

        this.beans.eventService.dispatchEvent(event);
    }

    public startRowEditing(key: string | null = null, charPress: string | null = null, sourceRenderedCell: CellCtrl | null = null, event: KeyboardEvent | null = null): void {
        // don't do it if already editing
        if (this.editingRow) { return; }

        this.getAllCellCtrls().forEach(cellCtrl => {
            const cellStartedEdit = cellCtrl === sourceRenderedCell;
            if (cellStartedEdit) {
                cellCtrl.startEditing(key, charPress, cellStartedEdit, event);
            } else {
                cellCtrl.startEditing(null, null, cellStartedEdit, event);
            }
        });
        this.setEditingRow(true);
    }

    public getAllCellCtrls(): CellCtrl[] {
        const res = [...this.centerCellCtrls.list, ...this.leftCellCtrls.list, ...this.rightCellCtrls.list];
        return res;
    }

    private postProcessClassesFromGridOptions(): void {
        const cssClasses = this.beans.rowCssClassCalculator.processClassesFromGridOptions(this.rowNode, this.scope);
        if (!cssClasses || !cssClasses.length) { return; }

        cssClasses.forEach(classStr => {
            this.allRowGuis.forEach(c => c.rowComp.addOrRemoveCssClass(classStr, true));
        });
    }

    private postProcessRowClassRules(): void {
        this.beans.rowCssClassCalculator.processRowClassRules(
            this.rowNode, this.scope,
            (className: string) => {
                this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass(className, true));
            },
            (className: string) => {
                this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass(className, false));
            }
        );
    }

    private setStylesFromGridOptions(): void {
        const rowStyles = this.processStylesFromGridOptions();
        this.allRowGuis.forEach(gui => gui.rowComp.setUserStyles(rowStyles));
    }

    public getRowBusinessKey(): string | undefined {
        const businessKeyForNodeFunc = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc();
        if (typeof businessKeyForNodeFunc !== 'function') { return; }

        return businessKeyForNodeFunc(this.rowNode);
    }

    private getPinnedForContainer(rowContainerType: RowContainerType): string | null {
        const pinned = rowContainerType === RowContainerType.LEFT ? Constants.PINNED_LEFT :
                        rowContainerType === RowContainerType.RIGHT ? Constants.PINNED_RIGHT : null;
        return pinned;
    }

    public getInitialRowClasses(rowContainerType: RowContainerType): string[] {
        const pinned = this.getPinnedForContainer(rowContainerType);

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

        return Object.assign({}, rowStyle, rowStyleFuncResult);
    }

    private onRowSelected(): void {
        const selected = this.rowNode.isSelected()!;
        this.allRowGuis.forEach(gui => {
            gui.rowComp.addOrRemoveCssClass('ag-row-selected', selected);
            setAriaSelected(gui.element, selected ? true : undefined);

            const ariaLabel = this.createAriaLabel();
            setAriaLabel(gui.element, ariaLabel == null ? '' : ariaLabel);
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
                eRow.classList.add('ag-row-hover');
            }
        });

        this.addManagedListener(this.rowNode, RowNode.EVENT_MOUSE_LEAVE, () => {
            eRow.classList.remove('ag-row-hover');
        });
    }

    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    public roundRowTopToBounds(rowTop: number): number {
        const gridBodyCon = this.beans.ctrlsService.getGridBodyCtrl();
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
        if (this.rowNode.rowHeight == null) { return; }
        const fromFunction = this.beans.gridOptionsWrapper.isGetRowHeightFunction();
        const rowHeight = this.rowNode.rowHeight;
        const defaultRowHeight = this.beans.gridOptionsWrapper.getDefaultRowHeight();

        this.allRowGuis.forEach(gui => {
            gui.element.style.height = `${rowHeight}px`;
            if (fromFunction) {
                gui.element.style.setProperty('--ag-row-height', `${Math.min(defaultRowHeight, rowHeight) - 2}px`);
            }
        });
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
            this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass('ag-opacity-zero', true));
        }
    }

    public destroySecondPass(): void {
        this.allRowGuis.length = 0;

        const destroyCellCtrls = (ctrls: CellCtrlListAndMap): CellCtrlListAndMap => {
            ctrls.list.forEach(c => c.destroy());
            return {list: [], map: {}};
        };

        this.centerCellCtrls = destroyCellCtrls(this.centerCellCtrls);
        this.leftCellCtrls = destroyCellCtrls(this.leftCellCtrls);
        this.rightCellCtrls = destroyCellCtrls(this.rightCellCtrls);
    }

    private setFocusedClasses(): void {
        this.allRowGuis.forEach(gui => {
            gui.rowComp.addOrRemoveCssClass('ag-row-focus', this.rowFocused);
            gui.rowComp.addOrRemoveCssClass('ag-row-no-focus', !this.rowFocused);
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

        this.refreshFirstAndLastRowStyles();
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
        this.allRowGuis.forEach(
            gui => suppressRowTransform ?
                gui.rowComp.setTop(topPx) :
                gui.rowComp.setTransform(`translateY(${topPx})`)
        );
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public getCellCtrl(column: Column): CellCtrl | null {
        // first up, check for cell directly linked to this column
        let res: CellCtrl | null = null;
        this.getAllCellCtrls().forEach(cellCtrl => {
            if (cellCtrl.getColumn() == column) {
                res = cellCtrl;
            }
        });

        if (res != null) { return res; }

        // second up, if not found, then check for spanned cols.
        // we do this second (and not at the same time) as this is
        // more expensive, as spanning cols is a
        // infrequently used feature so we don't need to do this most
        // of the time
        this.getAllCellCtrls().forEach(cellCtrl => {
            if (cellCtrl.getColSpanningList().indexOf(column) >= 0) {
                res = cellCtrl;
            }
        });

        return res;
    }

    private onRowIndexChanged(): void {
        // we only bother updating if the rowIndex is present. if it is not present, it means this row
        // is child of a group node, and the group node was closed, it's the only way to have no row index.
        // when this happens, row is about to be de-rendered, so we don't care, rowComp is about to die!
        if (this.rowNode.rowIndex != null) {
            this.onCellFocusChanged();
            this.updateRowIndexes();
            this.postProcessCss();
        }
    }

    private updateRowIndexes(): void {
        const rowIndexStr = this.rowNode.getRowIndexString();
        const headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
        const rowIsEven = this.rowNode.rowIndex! % 2 === 0;
        const ariaRowIndex = headerRowCount + this.rowNode.rowIndex! + 1;

        this.allRowGuis.forEach(c => {
            c.rowComp.setRowIndex(rowIndexStr);
            c.rowComp.addOrRemoveCssClass('ag-row-even', rowIsEven);
            c.rowComp.addOrRemoveCssClass('ag-row-odd', !rowIsEven);
            setAriaRowIndex(c.element, ariaRowIndex);
        });
    }

    // returns the pinned left container, either the normal one, or the embedded full with one if exists
    public getPinnedLeftRowElement(): HTMLElement {
        return this.leftGui ? this.leftGui.element : undefined!;
    }

    // returns the pinned right container, either the normal one, or the embedded full with one if exists
    public getPinnedRightRowElement(): HTMLElement {
        return this.rightGui ? this.rightGui.element : undefined!;
    }

    // returns the body container, either the normal one, or the embedded full with one if exists
    public getBodyRowElement(): HTMLElement {
        return this.centerGui ? this.centerGui.element : undefined!;
    }

    // returns the full width container
    public getFullWidthRowElement(): HTMLElement {
        return this.fullWidthGui ? this.fullWidthGui.element : undefined!;
    }

}