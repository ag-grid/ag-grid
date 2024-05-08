import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { BeanStub } from "../../context/beanStub";
import { Column, ColumnInstanceId, ColumnPinnedType } from "../../entities/column";
import { RowClassParams, RowStyle } from "../../entities/gridOptions";
import { RowNode } from "../../entities/rowNode";
import { RowPosition } from "../../entities/rowPositionUtils";
import { AgEventListener, Events, RowDoubleClickedEvent, RowEvent, VirtualRowRemovedEvent } from "../../events";
import { RowContainerType } from "../../gridBodyComp/rowContainer/rowContainerCtrl";
import { GridOptionsService } from "../../gridOptionsService";
import { BrandedType } from "../../interfaces/brandedType";
import { ProcessRowParams } from "../../interfaces/iCallbackParams";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { IFrameworkOverrides } from "../../interfaces/iFrameworkOverrides";
import { DataChangedEvent, IRowNode, RowHighlightPosition } from "../../interfaces/iRowNode";
import { setAriaExpanded, setAriaRowIndex } from "../../utils/aria";
import { isVisible } from "../../utils/dom";
import { isStopPropagationForAgGrid } from "../../utils/event";
import { executeNextVMTurn } from "../../utils/function";
import { exists, makeNull } from "../../utils/generic";
import { escapeString } from "../../utils/string";
import { Beans } from "../beans";
import { CellCtrl } from "../cell/cellCtrl";
import { RowCssClassCalculatorParams } from "./rowCssClassCalculator";

enum RowType {
    Normal = 'Normal',
    FullWidth = 'FullWidth',
    FullWidthLoading = 'FullWidthLoading',
    FullWidthGroup = 'FullWidthGroup',
    FullWidthDetail = 'FullWidthDetail'
}

let instanceIdSequence = 0;
export type RowCtrlInstanceId = BrandedType<string, 'RowCtrlInstanceId'>;

export interface IRowComp {
    setDomOrder(domOrder: boolean): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setCellCtrls(cellCtrls: CellCtrl[], useFlushSync: boolean): void;
    showFullWidth(compDetails: UserCompDetails): void;
    getFullWidthCellRenderer(): any;
    setTop(top: string): void;
    setTransform(transform: string): void;
    setRowIndex(rowIndex: string): void;
    setRowId(rowId: string): void;
    setRowBusinessKey(businessKey: string): void;
    setUserStyles(styles: RowStyle | undefined): void;
    refreshFullWidth(getUpdatedParams: () => any): boolean;
}

interface RowGui {
    rowComp: IRowComp;
    element: HTMLElement;
    containerType: RowContainerType;
}

interface CellCtrlListAndMap {
    list: CellCtrl[];
    map: { [key: ColumnInstanceId]: CellCtrl };
}

export class RowCtrl extends BeanStub {

    public static DOM_DATA_KEY_ROW_CTRL = 'renderedRow';

    private instanceId: RowCtrlInstanceId;

    private readonly rowNode: RowNode;
    private readonly beans: Beans;
    // The RowCtrl is never Wired, so it needs its own access
    // to the gridOptionsService to be able to call `addManagedPropertyListener`
    protected readonly gos: GridOptionsService;

    private rowType: RowType;

    private leftGui: RowGui | undefined;
    private centerGui: RowGui | undefined;
    private rightGui: RowGui | undefined;

    private allRowGuis: RowGui[] = [];

    private firstRowOnPage: boolean;
    private lastRowOnPage: boolean;

    private active = true;

    private rowFocused: boolean;

    private centerCellCtrls: CellCtrlListAndMap = { list: [], map: {} };
    private leftCellCtrls: CellCtrlListAndMap = { list: [], map: {} };
    private rightCellCtrls: CellCtrlListAndMap = { list: [], map: {} };

    private slideInAnimation: { [key in RowContainerType]: boolean } = {
        left: false,
        center: false,
        right: false,
        fullWidth: false
    };

    private fadeInAnimation: { [key in RowContainerType]: boolean } = {
        left: false,
        center: false,
        right: false,
        fullWidth: false
    };

    private rowDragComps: BeanStub[] = [];

    private readonly useAnimationFrameForCreate: boolean;

    private paginationPage: number;

    private rowLevel: number;
    private rowStyles: RowStyle | undefined;
    private readonly emptyStyle: RowStyle = {};
    private readonly printLayout: boolean;
    private readonly suppressRowTransform: boolean;

    private updateColumnListsPending = false;

    private rowId: string | null = null;
    private tabIndex: number | undefined;
    private businessKeySanitised: string | null = null;

    constructor(
        rowNode: RowNode,
        beans: Beans,
        animateIn: boolean,
        useAnimationFrameForCreate: boolean,
        printLayout: boolean
    ) {
        super();
        this.beans = beans;
        this.gos = beans.gos;
        this.rowNode = rowNode;
        this.paginationPage = beans.paginationProxy.getCurrentPage();
        this.useAnimationFrameForCreate = useAnimationFrameForCreate;
        this.printLayout = printLayout;
        this.suppressRowTransform = this.gos.get('suppressRowTransform');

        this.instanceId = rowNode.id + '-' + instanceIdSequence++ as RowCtrlInstanceId;
        this.rowId = escapeString(rowNode.id);

        this.rowLevel = beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);

        this.setRowType();
        this.setAnimateFlags(animateIn);
        this.rowStyles = this.processStylesFromGridOptions();

        this.addListeners();
    }

    public getRowId() {
        return this.rowId;
    }
    public getRowStyles() {
        return this.rowStyles;
    }
    public getTabIndex() {
        return this.tabIndex;
    }

    private isSticky(): boolean {
        return this.rowNode.sticky;
    }

    public getInstanceId(): RowCtrlInstanceId {
        return this.instanceId;
    }

    public setComp(rowComp: IRowComp, element: HTMLElement, containerType: RowContainerType): void {
        const gui: RowGui = { rowComp, element, containerType };
        this.allRowGuis.push(gui);

        if (containerType === RowContainerType.LEFT) {
            this.leftGui = gui;
        } else if (containerType === RowContainerType.RIGHT) {
            this.rightGui = gui;
        } else if (containerType === RowContainerType.FULL_WIDTH) {
        } else {
            this.centerGui = gui;
        }

        this.initialiseRowComp(gui);

        // pinned rows render before the main grid body in the SSRM, only fire the event after the main body has rendered.
        if (this.rowType !== 'FullWidthLoading' && !this.rowNode.rowPinned) {
            // this is fired within setComp as we know that the component renderer is now trying to render.
            // linked with the fact the function implementation queues behind requestAnimationFrame should allow
            // us to be certain that all rendering is done by the time the event fires.
            this.beans.rowRenderer.dispatchFirstDataRenderedEvent();
        }
    }

    public unsetComp(containerType: RowContainerType): void {
        this.allRowGuis = this.allRowGuis
            .filter(rowGui => rowGui.containerType !== containerType);

        switch (containerType) {
            case RowContainerType.LEFT:
                this.leftGui = undefined;
                break;
            case RowContainerType.RIGHT:
                this.rightGui = undefined;
                break;
            case RowContainerType.FULL_WIDTH:
                break;
            case RowContainerType.CENTER:
                this.centerGui = undefined;
                break;
            default:
        }
    }

    public isCacheable(): boolean {
        return this.rowType === RowType.FullWidthDetail
            && this.gos.get('keepDetailRows');
    }

    public setCached(cached: boolean): void {
        const displayValue = cached ? 'none' : '';
        this.allRowGuis.forEach(rg => rg.element.style.display = displayValue);
    }

    private initialiseRowComp(gui: RowGui): void {
        const gos = this.gos;

        this.listenOnDomOrder(gui);
        if (this.beans.columnModel.wasAutoRowHeightEverActive()) {
            this.rowNode.checkAutoHeights();
        }
        this.onRowHeightChanged(gui);
        this.updateRowIndexes(gui);
        this.setStylesFromGridOptions(false, gui); // no need to calculate styles already set in constructor

        this.updateColumnLists(!this.useAnimationFrameForCreate);

        const comp = gui.rowComp;

        const initialRowClasses = this.getInitialRowClasses(gui.containerType);
        initialRowClasses.forEach(name => comp.addOrRemoveCssClass(name, true));

        this.executeSlideAndFadeAnimations(gui);

        if (this.rowNode.group) {
            setAriaExpanded(gui.element, this.rowNode.expanded == true);
        }

        this.setRowCompRowId(comp);
        this.setRowCompRowBusinessKey(comp);

        // DOM DATA
        gos.setDomData(gui.element, RowCtrl.DOM_DATA_KEY_ROW_CTRL, this);
        this.addDestroyFunc(
            () => gos.setDomData(gui.element, RowCtrl.DOM_DATA_KEY_ROW_CTRL, null)
        );

        if (this.useAnimationFrameForCreate) {
            // the height animation we only want active after the row is alive for 1 second.
            // this stops the row animation working when rows are initially created. otherwise
            // auto-height rows get inserted into the dom and resized immediately, which gives
            // very bad UX (eg 10 rows get inserted, then all 10 expand, look particularly bad
            // when scrolling). so this makes sure when rows are shown for the first time, they
            // are resized immediately without animation.
            this.beans.animationFrameService.addDestroyTask(() => {
                if (!this.isAlive()) { return; }
                gui.rowComp.addOrRemoveCssClass('ag-after-created', true);
            });
        }

        this.executeProcessRowPostCreateFunc();
    }

    private setRowCompRowBusinessKey(comp: IRowComp): void {
        if (this.businessKeySanitised == null) { return; }
        comp.setRowBusinessKey(this.businessKeySanitised);
    }
    public getBusinessKey(): string | null {
        return this.businessKeySanitised;
    }

    private setRowCompRowId(comp: IRowComp) {
        this.rowId = escapeString(this.rowNode.id);
        if (this.rowId == null) { return; }

        comp.setRowId(this.rowId);
    }

    private executeSlideAndFadeAnimations(gui: RowGui): void {
        const {containerType} = gui;

        const shouldSlide = this.slideInAnimation[containerType];
        if (shouldSlide) {
            executeNextVMTurn(() => {
                this.onTopChanged();
            });
            this.slideInAnimation[containerType] = false;
        }

        const shouldFade = this.fadeInAnimation[containerType];
        if (shouldFade) {
            executeNextVMTurn(() => {
                gui.rowComp.addOrRemoveCssClass('ag-opacity-zero', false);
            });
            this.fadeInAnimation[containerType] = false;
        }
    }
    public isPrintLayout(): boolean {
        return this.printLayout;
    }

    public getFullWidthCellRenderers(): (any)[] {
        return [undefined];
    }

    // use by autoWidthCalculator, as it clones the elements
    public getCellElement(column: Column): HTMLElement | null {
        const cellCtrl = this.getCellCtrl(column);
        return cellCtrl ? cellCtrl.getGui() : null;
    }

    private executeProcessRowPostCreateFunc(): void {
        const func = this.gos.getCallback('processRowPostCreate');
        if (!func || !this.areAllContainersReady()) { return; }

        const params: WithoutGridCommon<ProcessRowParams> = {
            // areAllContainersReady asserts that centerGui is not null
            eRow: this.centerGui!.element,
            ePinnedLeftRow: this.leftGui ? this.leftGui.element : undefined,
            ePinnedRightRow: this.rightGui ? this.rightGui.element : undefined,
            node: this.rowNode,
            rowIndex: this.rowNode.rowIndex!,
            addRenderedRowListener: this.addEventListener.bind(this),
        };
        func(params);
    }

    private areAllContainersReady(): boolean {
        const isLeftReady = !!this.leftGui;
        const isCenterReady = !!this.centerGui;
        const isRightReady = !!this.rightGui;

        return isLeftReady && isCenterReady && isRightReady;
    }

    private setRowType(): void {
        const isStub = this.rowNode.stub && !this.gos.get('suppressServerSideFullWidthLoadingRow');
        const isFullWidthCell = this.rowNode.isFullWidthCell();
        const isDetailCell = this.gos.get('masterDetail') && this.rowNode.detail;
        const pivotMode = this.beans.columnModel.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        const isGroupRow = !!this.rowNode.group && !this.rowNode.footer;
        const isFullWidthGroup = isGroupRow && this.gos.isGroupUseEntireRow(pivotMode);

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

    private updateColumnLists(suppressAnimationFrame = false, useFlushSync = false): void {

        const noAnimation = suppressAnimationFrame
            || this.gos.get('suppressAnimationFrame')
            || this.printLayout;

        if (noAnimation) {
            this.updateColumnListsImpl(useFlushSync);
            return;
        }

        if (this.updateColumnListsPending) { return; }
        this.beans.animationFrameService.createTask(
            () => {
                if (!this.active) { return; }
                this.updateColumnListsImpl(true);
            },
            this.rowNode.rowIndex!,
            'createTasksP1'
        );
        this.updateColumnListsPending = true;
    }

    private createCellCtrls(prev: CellCtrlListAndMap, cols: Column[], pinned: ColumnPinnedType = null): CellCtrlListAndMap {
        const res: CellCtrlListAndMap = {
            list: [],
            map: {}
        };

        const addCell = (colInstanceId: ColumnInstanceId, cellCtrl: CellCtrl) => {
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

    private updateColumnListsImpl(useFlushSync: boolean): void {
        this.updateColumnListsPending = false;
        this.createAllCellCtrls();

        this.setCellCtrls(useFlushSync);
    }

    private setCellCtrls(useFlushSync: boolean) {
        this.allRowGuis.forEach(item => {
            const cellControls = this.getCellCtrlsForContainer(item.containerType);
            item.rowComp.setCellCtrls(cellControls, useFlushSync);
        });
    }

    private getCellCtrlsForContainer(containerType: RowContainerType) {
        
        switch (containerType) {
            case RowContainerType.LEFT:
                return this.leftCellCtrls.list;
            case RowContainerType.RIGHT:
                return this.rightCellCtrls.list;
            case RowContainerType.FULL_WIDTH:
                return [];
            case RowContainerType.CENTER:
                return this.centerCellCtrls.list;
            default:
                const exhaustiveCheck: never = containerType;
                throw new Error(`Unhandled case: ${exhaustiveCheck}`);
        }
    }

    private createAllCellCtrls() {
        const columnModel = this.beans.columnModel;
        if (this.printLayout) {
            this.centerCellCtrls = this.createCellCtrls(this.centerCellCtrls, columnModel.getAllDisplayedColumns());
            this.leftCellCtrls = { list: [], map: {} };
            this.rightCellCtrls = { list: [], map: {} };
        } else {
            const centerCols = columnModel.getViewportCenterColumnsForRow(this.rowNode);
            this.centerCellCtrls = this.createCellCtrls(this.centerCellCtrls, centerCols);
        }
    }

    private isCellEligibleToBeRemoved(cellCtrl: CellCtrl, nextContainerPinned: ColumnPinnedType): boolean {
        const REMOVE_CELL = true;
        const KEEP_CELL = false;

        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        const column = cellCtrl.getColumn();
        if (column.getPinned() != nextContainerPinned) { return REMOVE_CELL; }

        // we want to try and keep editing and focused cells
        const editing = cellCtrl.isEditing();

        const mightWantToKeepCell = editing;

        if (mightWantToKeepCell) {
            const column = cellCtrl.getColumn();
            const displayedColumns = this.beans.columnModel.getAllDisplayedColumns();
            const cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;
    }

    public getDomOrder(): boolean {
        const isEnsureDomOrder = this.gos.get('ensureDomOrder');
        return isEnsureDomOrder || this.gos.isDomLayout('print');
    }

    private listenOnDomOrder(gui: RowGui): void {
        const listener = () => {
            gui.rowComp.setDomOrder(this.getDomOrder());
        };

        this.addManagedPropertyListener('domLayout', listener);
        this.addManagedPropertyListener('ensureDomOrder', listener);
    }

    private setAnimateFlags(animateIn: boolean): void {
        if (this.isSticky() || !animateIn) { return; }

        const oldRowTopExists = exists(this.rowNode.oldRowTop);

        if (oldRowTopExists) {
            if (!this.gos.get('embedFullWidthRows')) {
                this.slideInAnimation.fullWidth = true;
                return;
            }

            // if the row had a previous position, we slide it in
            this.slideInAnimation.center = true;
        } else {
            if ( !this.gos.get('embedFullWidthRows')) {
                this.fadeInAnimation.fullWidth = true;
                return;
            }

            // if the row had no previous position, we fade it in
            this.fadeInAnimation.center = true;
        }
    }


    private addListeners(): void {
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        
        if (this.rowNode.detail) {
            // if the master row node has updated data, we also want to try to refresh the detail row
            this.addManagedListener(this.rowNode.parent!, RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        }

        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.postProcessCss.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_HIGHLIGHT_CHANGED, this.onRowNodeHighlightChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_UI_LEVEL_CHANGED, this.onUiLevelChanged.bind(this));

        const eventService = this.beans.eventService;
        this.addManagedListener(eventService, Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED, this.onPaginationPixelOffsetChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_MODEL_UPDATED, this.refreshFirstAndLastRowStyles.bind(this));

        this.addManagedListener(eventService, Events.EVENT_COLUMN_MOVED, this.updateColumnLists.bind(this));

        this.addDestroyFunc(() => {
            this.destroyBeans(this.rowDragComps, this.beans.context);
           
        });       

        this.addListenersForCellComps();
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

        // as data has changed update the dom row id attributes
        this.allRowGuis.forEach(gui => {
            this.setRowCompRowId(gui.rowComp);
            this.setRowCompRowBusinessKey(gui.rowComp);
        });

        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    }

    private postProcessCss(): void {
        this.setStylesFromGridOptions(true);
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
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


    private onDisplayedColumnsChanged(): void {
        // we skip animations for onDisplayedColumnChanged, as otherwise the client could remove columns and
        // then set data, and any old valueGetter's (ie from cols that were removed) would still get called.
        this.updateColumnLists(true);

        if (this.beans.columnModel.wasAutoRowHeightEverActive()) {
            this.rowNode.checkAutoHeights();
        }
    }

    private onVirtualColumnsChanged(): void {
        this.updateColumnLists(false, true);
    }

    public getRowPosition(): RowPosition {
        return {
            rowPinned: makeNull(this.rowNode.rowPinned),
            rowIndex: this.rowNode.rowIndex as number
        };
    }


    public getRowYPosition(): number {
        const displayedEl = this.allRowGuis.find(el => isVisible(el.element))?.element;

        if (displayedEl) { return displayedEl.getBoundingClientRect().top }

        return 0;
    }

    public recreateCell(cellCtrl: CellCtrl) {
        this.centerCellCtrls = this.removeCellCtrl(this.centerCellCtrls, cellCtrl);
        this.leftCellCtrls = this.removeCellCtrl(this.leftCellCtrls, cellCtrl);
        this.rightCellCtrls = this.removeCellCtrl(this.rightCellCtrls, cellCtrl);
        cellCtrl.destroy();
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
            res.map[cellCtrl.getColumn().getInstanceId()] = cellCtrl;
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
        return this.gos.addGridCommonParams({
            type: type,
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex!,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent
        });
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

    }

    public onRowClick(mouseEvent: MouseEvent) {
       
    }

    public isRowSelectionBlocked(): boolean {
        return true;
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


    public getAllCellCtrls(): CellCtrl[] {
        if (this.leftCellCtrls.list.length === 0 && this.rightCellCtrls.list.length === 0) {
            return this.centerCellCtrls.list;
        }
        const res = [...this.centerCellCtrls.list, ...this.leftCellCtrls.list, ...this.rightCellCtrls.list];
        return res;
    }

    private postProcessClassesFromGridOptions(): void {
        const cssClasses = this.beans.rowCssClassCalculator.processClassesFromGridOptions(this.rowNode);
        if (!cssClasses || !cssClasses.length) { return; }

        cssClasses.forEach(classStr => {
            this.allRowGuis.forEach(c => c.rowComp.addOrRemoveCssClass(classStr, true));
        });
    }

    private postProcessRowClassRules(): void {
        this.beans.rowCssClassCalculator.processRowClassRules(
            this.rowNode, (className: string) => {
                this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass(className, true));
            },
            (className: string) => {
                this.allRowGuis.forEach(gui => gui.rowComp.addOrRemoveCssClass(className, false));
            }
        );
    }

    private setStylesFromGridOptions(updateStyles : boolean, gui?: RowGui): void {
        if (updateStyles) {
            this.rowStyles = this.processStylesFromGridOptions();
        }
        this.forEachGui(gui, gui => gui.rowComp.setUserStyles(this.rowStyles));
    }


    private getInitialRowClasses(rowContainerType: RowContainerType): string[] {
        const params: RowCssClassCalculatorParams = {
            rowNode: this.rowNode,
            rowFocused: this.rowFocused,
            fadeRowIn: this.fadeInAnimation[rowContainerType],
            rowIsEven: this.rowNode.rowIndex! % 2 === 0,
            rowLevel: this.rowLevel,
            fullWidthRow: false,
            firstRowOnPage: this.isFirstRowOnPage(),
            lastRowOnPage: this.isLastRowOnPage(),
            printLayout: this.printLayout,
            expandable: this.rowNode.isExpandable(),
            pinned: null
        };
        return this.beans.rowCssClassCalculator.getInitialRowClasses(params);
    }

    public processStylesFromGridOptions(): RowStyle | undefined {
        // part 1 - rowStyle
        const rowStyle = this.gos.get('rowStyle');

        if (rowStyle && typeof rowStyle === 'function') {
            console.warn('AG Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            return;
        }

        // part 1 - rowStyleFunc
        const rowStyleFunc = this.gos.getCallback('getRowStyle');
        let rowStyleFuncResult: any;

        if (rowStyleFunc) {
            const params: WithoutGridCommon<RowClassParams> = {
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex!
            };
            rowStyleFuncResult = rowStyleFunc(params);
        }
        if (rowStyleFuncResult || rowStyle) {
            return Object.assign({}, rowStyle, rowStyleFuncResult);
        }
        // Return constant reference for React
        return this.emptyStyle;
    }

    public announceDescription(): void {
        if (this.isRowSelectionBlocked()) { return; }

        const selected = this.rowNode.isSelected()!;
        if (selected && this.beans.gos.get('suppressRowDeselection')) { return; }

        const translate = this.beans.localeService.getLocaleTextFunc();
        const label = translate(
            selected ? 'ariaRowDeselect' : 'ariaRowSelect',
            `Press SPACE to ${selected ? 'deselect' : 'select'} this row.`
        );

        this.beans.ariaAnnouncementService.announceValue(label);
    }

    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    private roundRowTopToBounds(rowTop: number): number {
        const range = this.beans.ctrlsService.getGridBodyCtrl().getScrollFeature().getApproximateVScollPosition();
        const minPixel = this.applyPaginationOffset(range.top, true) - 100;
        const maxPixel = this.applyPaginationOffset(range.bottom, true) + 100;

        return Math.min(Math.max(minPixel, rowTop), maxPixel);
    }

    protected getFrameworkOverrides(): IFrameworkOverrides {
        return this.beans.frameworkOverrides;
    }

    private forEachGui(gui: RowGui | undefined, callback: (gui: RowGui) => void): void {
        if (gui) {
            callback(gui);
        } else {
            this.allRowGuis.forEach(callback);
        }
    }

    private onRowHeightChanged(gui?: RowGui): void {
        // check for exists first - if the user is resetting the row height, then
        // it will be null (or undefined) momentarily until the next time the flatten
        // stage is called where the row will then update again with a new height
        if (this.rowNode.rowHeight == null) { return; }

        const rowHeight = this.rowNode.rowHeight;

        const defaultRowHeight = this.beans.environment.getDefaultRowHeight();
        const isHeightFromFunc = this.gos.isGetRowHeightFunction();
        const heightFromFunc = isHeightFromFunc ? this.gos.getRowHeightForNode(this.rowNode).height : undefined;
        const lineHeight = heightFromFunc ? `${Math.min(defaultRowHeight, heightFromFunc) - 2}px` : undefined;

        this.forEachGui(gui, gui => {
            gui.element.style.height = `${rowHeight}px`;

            // If the row height is coming from a function, this means some rows can
            // be smaller than the theme had intended. so we set --ag-line-height on
            // the row, which is picked up by the theme CSS and is used in a calc
            // for the CSS line-height property, which makes sure the line-height is
            // not bigger than the row height, otherwise the row text would not fit.
            // We do not use rowNode.rowHeight here, as this could be the result of autoHeight,
            // and we found using the autoHeight result causes a loop, where changing the
            // line-height them impacts the cell height, resulting in a new autoHeight,
            // resulting in a new line-height and so on loop.
            // const heightFromFunc = this.gos.getRowHeightForNode(this.rowNode).height;
            if (lineHeight) {
                gui.element.style.setProperty('--ag-line-height', lineHeight);
            }
        });
    }

    public addEventListener(eventType: string, listener: AgEventListener): void {
        super.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: AgEventListener): void {
        super.removeEventListener(eventType, listener);
    }

    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    public destroyFirstPass(suppressAnimation: boolean = false): void {
        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        if (!suppressAnimation && this.gos.isAnimateRows() && !this.isSticky()) {
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

        this.rowNode.setHovered(false);

        const event: VirtualRowRemovedEvent = this.createRowEvent(Events.EVENT_VIRTUAL_ROW_REMOVED);

        this.dispatchEvent(event);
        this.beans.eventService.dispatchEvent(event);
        super.destroy();
    }

    public destroySecondPass(): void {
        this.allRowGuis.length = 0;

        // if we are editing, destroying the row will stop editing

        const destroyCellCtrls = (ctrls: CellCtrlListAndMap): CellCtrlListAndMap => {
            ctrls.list.forEach(c => c.destroy());
            return { list: [], map: {} };
        };

        this.centerCellCtrls = destroyCellCtrls(this.centerCellCtrls);
        this.leftCellCtrls = destroyCellCtrls(this.leftCellCtrls);
        this.rightCellCtrls = destroyCellCtrls(this.rightCellCtrls);
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
        if (this.rowNode.isRowPinned() || this.rowNode.sticky) {
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
            const skipScaling = this.rowNode.isRowPinned() || this.rowNode.sticky;
            const afterScalingPixels = skipScaling ? afterPaginationPixels : this.beans.rowContainerHeightService.getRealPixelPosition(afterPaginationPixels);
            const topPx = `${afterScalingPixels}px`;
            this.setRowTopStyle(topPx);
        }
    }

    // the top needs to be set into the DOM element when the element is created, not updated afterwards.
    // otherwise the transition would not work, as it would be transitioning from zero (the unset value).
    // for example, suppose a row that is outside the viewport, then user does a filter to remove other rows
    // and this row now appears in the viewport, and the row moves up (ie it was under the viewport and not rendered,
    // but now is in the viewport) then a new RowComp is created, however it should have it's position initialised
    // to below the viewport, so the row will appear to animate up. if we didn't set the initial position at creation
    // time, the row would animate down (ie from position zero).
    public getInitialRowTop(rowContainerType: RowContainerType): string | undefined {
        return this.suppressRowTransform ? this.getInitialRowTopShared(rowContainerType) : undefined;
    }
    public getInitialTransform(rowContainerType: RowContainerType): string | undefined {
        return this.suppressRowTransform ? undefined : `translateY(${this.getInitialRowTopShared(rowContainerType)})`;
    }
    private getInitialRowTopShared(rowContainerType: RowContainerType): string {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) { return ''; }

        let rowTop: number;
        if (this.isSticky()) {
            rowTop = this.rowNode.stickyRowTop;
        } else {
            // if sliding in, we take the old row top. otherwise we just set the current row top.
            const pixels = this.slideInAnimation[rowContainerType] ? this.roundRowTopToBounds(this.rowNode.oldRowTop!) : this.rowNode.rowTop;
            const afterPaginationPixels = this.applyPaginationOffset(pixels!);
            // we don't apply scaling if row is pinned
            rowTop = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.rowContainerHeightService.getRealPixelPosition(afterPaginationPixels);
        }

        return rowTop + 'px';
    }

    private setRowTopStyle(topPx: string): void {
        this.allRowGuis.forEach(
            gui => this.suppressRowTransform ?
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

        return res;
    }

    private onRowIndexChanged(): void {
        // we only bother updating if the rowIndex is present. if it is not present, it means this row
        // is child of a group node, and the group node was closed, it's the only way to have no row index.
        // when this happens, row is about to be de-rendered, so we don't care, rowComp is about to die!
        if (this.rowNode.rowIndex != null) {
            this.updateRowIndexes();
            this.postProcessCss();
        }
    }

    public getRowIndex() {
        return this.rowNode.getRowIndexString();
    }
        public getHeaderRowCount(): number {
        const centerHeaderContainer = this.beans.ctrlsService.getHeaderRowContainerCtrl();
        return centerHeaderContainer ? centerHeaderContainer.getRowCount() : 0;
    }

    private updateRowIndexes(gui?: RowGui): void {
        const rowIndexStr = this.rowNode.getRowIndexString();
        const headerRowCount = this.getHeaderRowCount();
        const rowIsEven = this.rowNode.rowIndex! % 2 === 0;
        const ariaRowIndex = headerRowCount + this.rowNode.rowIndex! + 1;

        this.forEachGui(gui, c => {
            c.rowComp.setRowIndex(rowIndexStr);
            c.rowComp.addOrRemoveCssClass('ag-row-even', rowIsEven);
            c.rowComp.addOrRemoveCssClass('ag-row-odd', !rowIsEven);
            setAriaRowIndex(c.element, ariaRowIndex);
        });
    }
}
