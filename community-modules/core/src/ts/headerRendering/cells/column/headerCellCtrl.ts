import { ColumnApi } from "../../../columns/columnApi";
import { ColumnModel } from "../../../columns/columnModel";
import { UserCompDetails, UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, PreDestroy } from "../../../context/context";
import { DragAndDropService, DragItem, DragSource, DragSourceType } from "../../../dragAndDrop/dragAndDropService";
import { Column } from "../../../entities/column";
import { Events } from "../../../eventKeys";
import { GridApi } from "../../../gridApi";
import { IMenuFactory } from "../../../interfaces/iMenuFactory";
import { Beans } from "../../../rendering/beans";
import { ColumnHoverService } from "../../../rendering/columnHoverService";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { SortController } from "../../../sortController";
import { ColumnSortState, getAriaSortState } from "../../../utils/aria";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { ITooltipFeatureComp, ITooltipFeatureCtrl, TooltipFeature } from "../../../widgets/tooltipFeature";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { HeaderComp, IHeader, IHeaderParams } from "./headerComp";
import { ResizeFeature } from "./resizeFeature";
import { SelectAllFeature } from "./selectAllFeature";

export interface IHeaderCellComp extends IAbstractHeaderCellComp, ITooltipFeatureComp {
    setWidth(width: string): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setColId(id: string): void;
    setAriaLabel(id?: string): void;
    setAriaDescribedBy(id?: string): void;
    setAriaSort(sort?: ColumnSortState): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeader | undefined;
}

export class HeaderCellCtrl extends AbstractHeaderCellCtrl {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;
    @Autowired('beans') protected beans: Beans;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private colDefVersion: number;

    private comp: IHeaderCellComp;

    private column: Column;

    private refreshFunctions: (() => void)[] = [];

    private selectAllFeature: SelectAllFeature;

    private moveDragSource: DragSource | undefined;

    private sortable: boolean | null | undefined;
    private displayName: string | null;
    private draggable: boolean;
    private menuEnabled: boolean;
    private dragSourceElement: HTMLElement | undefined;

    private userCompDetails: UserCompDetails;

    private userHeaderClasses: Set<string> = new Set();

    constructor(column: Column, parentRowCtrl: HeaderRowCtrl) {
        super(column, parentRowCtrl);
        this.column = column;
    }

    public setComp(comp: IHeaderCellComp, eGui: HTMLElement, eResize: HTMLElement): void {
        super.setGui(eGui);
        this.comp = comp;

        this.colDefVersion = this.columnModel.getColDefVersion();

        this.updateState();
        this.setupWidth();
        this.setupMovingCss();
        this.setupMenuClass();
        this.setupSortableClass();
        this.addColumnHoverListener();
        this.setupFilterCss();
        this.setupColId();
        this.setupClassesFromColDef();
        this.setupTooltip();
        this.addActiveHeaderMouseListeners();
        this.setupSelectAll();
        this.setupUserComp();
        this.refreshAria();

        this.createManagedBean(new ResizeFeature(this.getPinned(), this.column, eResize, comp, this));
        this.createManagedBean(new HoverFeature([this.column], eGui));
        this.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new ManagedFocusFeature(
            eGui,
            {
                shouldStopEventPropagation: e => this.shouldStopEventPropagation(e),
                onTabKeyDown: () => null,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this),
                onFocusOut: this.onFocusOut.bind(this)
            }
        ));

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
    }

    private setupUserComp(): void {
        const compDetails = this.lookupUserCompDetails();
        this.setCompDetails(compDetails);
    }

    private setCompDetails(compDetails: UserCompDetails): void {
        this.userCompDetails = compDetails;
        this.comp.setUserCompDetails(compDetails);
    }

    private lookupUserCompDetails(): UserCompDetails {
        const params = this.createParams();
        const colDef = this.column.getColDef();
        return this.userComponentFactory.getHeaderCompDetails(colDef, params)!;
    }

    private createParams(): IHeaderParams {

        const colDef = this.column.getColDef();

        const params: IHeaderParams = {
            column: this.column,
            displayName: this.displayName,
            enableSorting: colDef.sortable,
            enableMenu: this.menuEnabled,
            showColumnMenu: (source: HTMLElement) => {
                this.gridApi.showColumnMenuAfterButtonClick(this.column, source);
            },
            progressSort: (multiSort?: boolean) => {
                this.sortController.progressSort(this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: (sort: 'asc' | 'desc' | null, multiSort?: boolean) => {
                this.sortController.setSortForColumn(this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext(),
            eGridHeader: this.getGui()
        } as IHeaderParams;

        return params;
    }

    private setupSelectAll(): void {
        this.selectAllFeature = this.createManagedBean(new SelectAllFeature(this.column));
        this.selectAllFeature.setComp(this.comp);
    }

    public getSelectAllGui(): HTMLElement {
        return this.selectAllFeature.getCheckboxGui();
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        if (e.key === KeyCode.SPACE) {
            this.selectAllFeature.onSpaceKeyPressed(e);
        }
        if (e.key === KeyCode.ENTER) {
            this.onEnterKeyPressed(e);
        }
    }

    private onEnterKeyPressed(e: KeyboardEvent): void {
        /// THIS IS BAD - we are assuming the header is not a user provided comp
        const headerComp = this.comp.getUserCompInstance() as HeaderComp;
        if (!headerComp) { return; }

        if (e.ctrlKey || e.metaKey) {
            if (this.menuEnabled && headerComp.showMenu) {
                e.preventDefault();
                headerComp.showMenu();
            }
        } else if (this.sortable) {
            const multiSort = e.shiftKey;
            this.sortController.progressSort(this.column, multiSort, "uiColumnSorted");
        }
    }

    public isMenuEnabled(): boolean {
        return this.menuEnabled;
    }

    protected onFocusIn(e: FocusEvent) {
        if (!this.getGui().contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.getRowIndex();
            this.focusService.setFocusedHeader(rowIndex, this.column);
        }

        this.setActiveHeader(true);
    }

    protected onFocusOut(e: FocusEvent) {
        if (
            this.getGui().contains(e.relatedTarget as HTMLElement)
        ) { return; }

        this.setActiveHeader(false);
    }

    private setupTooltip(): void {

        const tooltipCtrl: ITooltipFeatureCtrl = {
            getColumn: () => this.column,
            getColDef: () => this.column.getColDef(),
            getGui: () => this.eGui,
            getLocation: () => 'header',
            getTooltipValue: () => {
                const res = this.column.getColDef().headerTooltip;
                return res;
            },
        };

        const tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl, this.beans));

        tooltipFeature.setComp(this.comp);

        this.refreshFunctions.push(() => tooltipFeature.refreshToolTip());
    }

    private setupClassesFromColDef(): void {
        const refreshHeaderClasses = () => {
            const colDef = this.column.getColDef();
            const goa = this.gridOptionsWrapper;
            const classes = CssClassApplier.getHeaderClassesFromColDef(colDef, goa, this.column, null);

            const oldClasses = this.userHeaderClasses;
            this.userHeaderClasses = new Set(classes);

            classes.forEach(c => {
                if (oldClasses.has(c)) {
                    // class already added, no need to apply it, but remove from old set
                    oldClasses.delete(c);
                } else {
                    // class new since last time, so apply it
                    this.comp.addOrRemoveCssClass(c, true);
                }
            });

            // now old set only has classes that were applied last time, but not this time, so remove them
            oldClasses.forEach(c => this.comp.addOrRemoveCssClass(c, false));
        };

        this.refreshFunctions.push(refreshHeaderClasses);
        refreshHeaderClasses();
    }

    public setDragSource(eSource: HTMLElement | undefined): void {
        this.dragSourceElement = eSource;
        this.removeDragSource();

        if (!eSource) { return; }

        if (!this.draggable) { return; }

        this.moveDragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eSource,
            defaultIconName: DragAndDropService.ICON_HIDE,
            getDragItem: () => this.createDragItem(),
            dragItemName: this.displayName,
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

    @PreDestroy
    public removeDragSource(): void {
        if (this.moveDragSource) {
            this.dragAndDropService.removeDragSource(this.moveDragSource);
            this.moveDragSource = undefined;
        }
    }

    private onNewColumnsLoaded(): void {
        const colDefVersionNow = this.columnModel.getColDefVersion();
        if (colDefVersionNow != this.colDefVersion) {
            this.colDefVersion = colDefVersionNow;
            this.refresh();
        }
    }

    private updateState(): void {
        const colDef = this.column.getColDef();
        this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;
        this.sortable = colDef.sortable;
        this.displayName = this.calculateDisplayName();
        this.draggable = this.workOutDraggable();
    }

    public addRefreshFunction(func: () => void): void {
        this.refreshFunctions.push(func);
    }

    private refresh(): void {
        this.updateState();
        this.refreshHeaderComp();
        this.refreshAria();
        this.refreshFunctions.forEach(f => f());
    }

    private refreshHeaderComp(): void {
        const newCompDetails = this.lookupUserCompDetails();

        const compInstance = this.comp.getUserCompInstance();

        // only try refresh if old comp exists adn it is the correct type
        const attemptRefresh = compInstance != null && this.userCompDetails.componentClass == newCompDetails.componentClass;

        const headerCompRefreshed = attemptRefresh ? this.attemptHeaderCompRefresh(newCompDetails.params) : false;

        if (headerCompRefreshed) {
            // we do this as a refresh happens after colDefs change, and it's possible the column has had it's
            // draggable property toggled. no need to call this if not refreshing, as setDragSource is done
            // as part of appendHeaderComp
            this.setDragSource(this.dragSourceElement);
        } else {
            this.setCompDetails(newCompDetails);
        }
    }

    public attemptHeaderCompRefresh(params: IHeaderParams): boolean {
        const headerComp = this.comp.getUserCompInstance();
        if (!headerComp) { return false; }

        // if no refresh method, then we want to replace the headerComp
        if (!headerComp.refresh) { return false; }

        const res = headerComp.refresh(params);

        return res;
    }

    private calculateDisplayName(): string | null {
        return this.columnModel.getDisplayNameForColumn(this.column, 'header', true);
    }

    private checkDisplayName(): void {
        // display name can change if aggFunc different, eg sum(Gold) is now max(Gold)
        if (this.displayName !== this.calculateDisplayName()) {
            this.refresh();
        }
    }

    private workOutDraggable(): boolean {
        const colDef = this.column.getColDef();
        const isSuppressMovableColumns = this.gridOptionsWrapper.isSuppressMovableColumns();

        const colCanMove = !isSuppressMovableColumns && !colDef.suppressMovable && !colDef.lockPosition;

        // we should still be allowed drag the column, even if it can't be moved, if the column
        // can be dragged to a rowGroup or pivot drop zone
        return !!colCanMove || !!colDef.enableRowGroup || !!colDef.enablePivot;
    }

    private onColumnRowGroupChanged(): void {
        this.checkDisplayName();
    }

    private onColumnPivotChanged(): void {
        this.checkDisplayName();
    }

    private onColumnValueChanged(): void {
        this.checkDisplayName();
    }

    private setupWidth(): void {
        const listener = () => {
            this.comp.setWidth(this.column.getActualWidth() + 'px');
        };

        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }

    private setupMovingCss(): void {
        const listener = () => {
            // this is what makes the header go dark when it is been moved (gives impression to
            // user that the column was picked up).
            this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());
        };

        this.addManagedListener(this.column, Column.EVENT_MOVING_CHANGED, listener);
        listener();
    }

    private setupMenuClass(): void {
        const listener = () => {
            this.comp.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
        };

        this.addManagedListener(this.column, Column.EVENT_MENU_VISIBLE_CHANGED, listener);
        listener();
    }

    private setupSortableClass(): void {

        const updateSortableCssClass = () => {
            this.comp.addOrRemoveCssClass('ag-header-cell-sortable', !!this.sortable);
        };

        updateSortableCssClass();

        this.addRefreshFunction(updateSortableCssClass);
        this.addManagedListener(this.column, Column.EVENT_SORT_CHANGED, this.refreshAriaSort.bind(this));
    }

    private refreshAriaSort(): void {
        if (this.sortable) {
            this.comp.setAriaSort(getAriaSortState(this.column));
        } else {
            this.comp.setAriaSort();
        }
    }

    private refreshAriaLabel(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        const label: string[] = [];

        if (this.sortable) {
            label.push(translate('ariaSortableColumn', 'Press ENTER to sort.'));
        }

        if (this.menuEnabled) {
            label.push(translate('ariaMenuColumn', 'Press CTRL ENTER to open column menu.'));
        }

        if (label.length) {
            this.comp.setAriaLabel(label.join(' '));
        } else {
            this.comp.setAriaLabel();
        }
    }

    private refreshAria(): void {
        this.refreshAriaSort();
        this.refreshAriaLabel();
    }

    private addColumnHoverListener(): void {
        const listener = () => {
            if (!this.gridOptionsWrapper.isColumnHoverHighlight()) { return; }
            const isHovered = this.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', isHovered);
        };

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }

    private setupFilterCss(): void {
        const listener = () => {
            this.comp.addOrRemoveCssClass('ag-header-cell-filtered', this.column.isFilterActive());
        };

        this.addManagedListener(this.column, Column.EVENT_FILTER_ACTIVE_CHANGED, listener);
        listener();
    }

    private setupColId(): void {
        this.comp.setColId(this.column.getColId());
    }

    private addActiveHeaderMouseListeners(): void {
        const listener = (e: MouseEvent) => this.setActiveHeader(e.type === 'mouseenter');
        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
    }

    private setActiveHeader(active: boolean): void {
        this.comp.addOrRemoveCssClass('ag-header-active', active);
    }
}
