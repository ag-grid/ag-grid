import { ColumnApi } from "../../../columns/columnApi";
import { ColumnModel } from "../../../columns/columnModel";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, PostConstruct, PreDestroy } from "../../../context/context";
import { DragAndDropService, DragItem, DragSource, DragSourceType } from "../../../dragAndDrop/dragAndDropService";
import { ColDef } from "../../../entities/colDef";
import { Column } from "../../../entities/column";
import { Events } from "../../../events";
import { GridApi } from "../../../gridApi";
import { IMenuFactory } from "../../../interfaces/iMenuFactory";
import { Beans } from "../../../rendering/beans";
import { ColumnHoverService } from "../../../rendering/columnHoverService";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { ITooltipParams } from "../../../rendering/tooltipComponent";
import { SortController } from "../../../sortController";
import { getAriaSortState, removeAriaSort, setAriaSort } from "../../../utils/aria";
import { addCssClass, addOrRemoveCssClass, removeCssClass, setDisplayed } from "../../../utils/dom";
import { AgCheckbox } from "../../../widgets/agCheckbox";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";
import { HeaderComp, IHeaderComp, IHeaderParams } from "./headerComp";
import { SelectAllFeature } from "./selectAllFeature";

export class HeaderCellComp extends AbstractHeaderCellComp {

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell" role="columnheader" unselectable="on" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
            <ag-checkbox ref="cbSelectAll" class="ag-header-select-all" role="presentation"></ag-checkbox>
        </div>`;

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;
    @Autowired('beans') protected beans: Beans;

    @RefSelector('eResize') private eResize: HTMLElement;
    @RefSelector('cbSelectAll') private cbSelectAll: AgCheckbox;

    protected readonly column: Column;
    protected readonly pinned: string | null;

    private headerComp: IHeaderComp | undefined;
    private headerCompGui: HTMLElement | undefined;

    private headerCompVersion = 0;
    private menuEnabled: boolean;

    private moveDragSource: DragSource | undefined;

    private colDefHeaderComponent?: string | { new(): any; };
    private colDefHeaderComponentFramework?: any;

    private ctrl: HeaderCellCtrl;

    constructor(ctrl: HeaderCellCtrl) {
        super(HeaderCellComp.TEMPLATE);
        this.column = ctrl.getColumnGroupChild() as Column;
        this.pinned = ctrl.getPinned();
        this.ctrl = ctrl;
    }

    @PostConstruct
    private postConstruct(): void {

        const eGui = this.getGui();

        const compProxy: IHeaderCellComp = {
            focus: ()=> this.getFocusableElement().focus(),
            setWidth: width => eGui.style.width = width,
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setResizeDisplayed: displayed => setDisplayed(this.eResize, displayed),

            refreshHeaderComp: ()=> this.refreshHeaderComp()
        };

        this.ctrl.setComp(compProxy, this.getGui(), this.eResize);

        this.setupTooltip();
        this.setupMenuClass();
        this.setupSortableClass();
        this.addColumnHoverListener();
        this.addActiveHeaderMouseListeners();

        this.createManagedBean(new ManagedFocusFeature(
            this.getFocusableElement(),
            {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this),
                onFocusOut: this.onFocusOut.bind(this)
            }
        ));

        this.createManagedBean(new HoverFeature([this.column], this.getGui()));

        this.addManagedListener(this.column, Column.EVENT_FILTER_ACTIVE_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();

        this.createManagedBean(new SelectAllFeature(this.cbSelectAll, this.column));
        this.cbSelectAll.setParentComponent(this);
        this.createManagedBean(new SetLeftFeature(this.column, this.getGui(), this.beans));

        this.addAttributes();
        CssClassApplier.addHeaderClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper,
            this.column, null);


        this.appendHeaderComp();

    }

    private refreshHeaderComp(): void {
        // if no header comp created yet, it's cos of async creation, so first version is yet
        // to get here, in which case nothing to refresh
        if (!this.headerComp) { return; }

        const colDef = this.column.getColDef();
        const newHeaderCompConfigured =
            this.colDefHeaderComponent != colDef.headerComponent
            || this.colDefHeaderComponentFramework != colDef.headerComponentFramework;

        const headerCompRefreshed = newHeaderCompConfigured ? false : this.attemptHeaderCompRefresh();
        if (headerCompRefreshed) {
            const dragSourceIsMissing = this.ctrl.temp_isDraggable() && !this.moveDragSource;
            const dragSourceNeedsRemoving = !this.ctrl.temp_isDraggable() && this.moveDragSource;
            if (dragSourceIsMissing || dragSourceNeedsRemoving) {
                this.attachDraggingToHeaderComp();
            }
        } else {
            this.appendHeaderComp();
        }
    }

    @PreDestroy
    private destroyHeaderComp(): void {
        if (this.headerComp) {
            this.getGui().removeChild(this.headerCompGui!);
            this.headerComp = this.destroyBean(this.headerComp);
            this.headerCompGui = undefined;
        }
        this.removeMoveDragSource();
    }

    private removeMoveDragSource(): void {
        if (this.moveDragSource) {
            this.dragAndDropService.removeDragSource(this.moveDragSource);
            this.moveDragSource = undefined;
        }
    }

    public attemptHeaderCompRefresh(): boolean {
        // if no refresh method, then we want to replace the headerComp
        if (!this.headerComp!.refresh) { return false; }

        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        const params = this.createParams();

        // take any custom params off of the user
        const finalParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(this.getComponentHolder(), 'headerComponent', params);

        const res = this.headerComp!.refresh(finalParams);

        return res;
    }

    private addActiveHeaderMouseListeners(): void {
        const listener = (e: MouseEvent) => this.setActiveHeader(e.type === 'mouseenter');
        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
    }

    private setActiveHeader(active: boolean): void {
        addOrRemoveCssClass(this.getGui(), 'ag-header-active', active);
    }

    protected onFocusIn(e: FocusEvent) {
        if (!this.getGui().contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.ctrl.getRowIndex();
            this.focusService.setFocusedHeader(rowIndex, this.getColumn());
        }

        this.setActiveHeader(true);
    }

    protected onFocusOut(e: FocusEvent) {
        if (
            this.getGui().contains(e.relatedTarget as HTMLElement)
        ) { return; }

        this.setActiveHeader(false);
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        const headerComp = this.headerComp as HeaderComp;
        if (!headerComp) { return; }

        if (e.keyCode === KeyCode.SPACE) {
            const checkbox = this.cbSelectAll;
            if (checkbox.isDisplayed() && !checkbox.getGui().contains(document.activeElement)) {
                e.preventDefault();
                checkbox.setValue(!checkbox.getValue());
            }
        }

        if (e.keyCode === KeyCode.ENTER) {
            if (e.ctrlKey || e.metaKey) {
                if (this.menuEnabled && headerComp.showMenu) {
                    e.preventDefault();
                    headerComp.showMenu();
                }
            } else if (this.ctrl.temp_isSortable()) {
                const multiSort = e.shiftKey;
                this.sortController.progressSort(this.column, multiSort, "uiColumnSorted");
            }
        }
    }

    protected onTabKeyDown(): void { }

    public getComponentHolder(): ColDef {
        return this.column.getColDef();
    }

    private addColumnHoverListener(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    }

    private onColumnHover(): void {
        if (!this.gridOptionsWrapper.isColumnHoverHighlight()) { return; }
        const isHovered = this.columnHoverService.isHovered(this.column);
        addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    }

    private setupSortableClass(): void {

        const eGui = this.getGui();

        const updateSortableCssClass = () => {
            addOrRemoveCssClass(eGui, 'ag-header-cell-sortable', !!this.ctrl.temp_isSortable());
        };

        const updateAriaSort = () => {
            if (this.ctrl.temp_isSortable()) {
                setAriaSort(eGui, getAriaSortState(this.column));
            } else {
                removeAriaSort(eGui);
            }
        };

        updateSortableCssClass();
        updateAriaSort();

        this.ctrl.addRefreshFunction(updateSortableCssClass);
        this.ctrl.addRefreshFunction(updateAriaSort);

        this.addManagedListener(this.column, Column.EVENT_SORT_CHANGED, updateAriaSort.bind(this));
    }

    private onFilterChanged(): void {
        const filterPresent = this.column.isFilterActive();
        addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
    }

    private appendHeaderComp(): void {
        this.headerCompVersion++;

        const colDef = this.column.getColDef();
        this.colDefHeaderComponent = colDef.headerComponent;
        this.colDefHeaderComponentFramework = colDef.headerComponentFramework;

        const params = this.createParams();
        const callback = this.afterHeaderCompCreated.bind(this, this.headerCompVersion);
        this.userComponentFactory.newHeaderComponent(params)!.then(callback);
    }

    private createParams(): IHeaderParams {

        const colDef = this.column.getColDef();

        this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;

        const params = {
            column: this.column,
            displayName: this.ctrl.temp_getDisplayName(),
            enableSorting: colDef.sortable,
            enableMenu: this.menuEnabled,
            showColumnMenu: (source: HTMLElement) => {
                this.gridApi.showColumnMenuAfterButtonClick(this.column, source);
            },
            progressSort: (multiSort?: boolean) => {
                this.sortController.progressSort(this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: (sort: string, multiSort?: boolean) => {
                this.sortController.setSortForColumn(this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext(),
            eGridHeader: this.getGui()
        } as IHeaderParams;
        return params;
    }

    private afterHeaderCompCreated(version: number, headerComp: IHeaderComp): void {

        if (version != this.headerCompVersion || !this.isAlive()) {
            this.destroyBean(headerComp);
            return;
        }

        this.destroyHeaderComp();

        this.headerComp = headerComp;
        this.headerCompGui = headerComp.getGui();
        this.getGui().appendChild(this.headerCompGui);

        this.attachDraggingToHeaderComp();
    }

    private attachDraggingToHeaderComp(): void {

        this.removeMoveDragSource();

        if (!this.ctrl.temp_isDraggable()) { return; }

        this.moveDragSource = {
            type: DragSourceType.HeaderCell,
            eElement: this.headerCompGui!,
            defaultIconName: DragAndDropService.ICON_HIDE,
            getDragItem: () => this.createDragItem(),
            dragItemName: this.ctrl.temp_getDisplayName(),
            onDragStarted: () => this.column.setMoving(true, "uiColumnMoved"),
            onDragStopped: () => this.column.setMoving(false, "uiColumnMoved")
        };

        this.dragAndDropService.addDragSource(this.moveDragSource, true);
    }

    private createDragItem(): DragItem {
        const visibleState: { [key: string]: boolean; } = {};
        visibleState[this.column.getId()] = this.column.isVisible();

        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    public getTooltipParams(): ITooltipParams {
        const res = super.getTooltipParams();
        res.location = 'header';
        res.colDef = this.column.getColDef();
        return res;
    }

    private setupTooltip(): void {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };

        refresh();

        this.ctrl.addRefreshFunction(refresh);
    }

    private addAttributes(): void {
        this.getGui().setAttribute("col-id", this.column.getColId());
    }

    private setupMenuClass(): void {
        this.addManagedListener(this.column, Column.EVENT_MENU_VISIBLE_CHANGED, this.onMenuVisible.bind(this));
    }

    private onMenuVisible(): void {
        this.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
    }

}
