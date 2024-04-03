import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { KeyCode } from '../../../constants/keyCode';
import { DragAndDropService, DragItem, DragSourceType } from "../../../dragAndDrop/dragAndDropService";
import { Column } from "../../../entities/column";
import { Events } from "../../../eventKeys";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { ColumnSortState, getAriaSortState } from "../../../utils/aria";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { ITooltipFeatureCtrl, TooltipFeature } from "../../../widgets/tooltipFeature";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { HeaderComp, IHeader, IHeaderParams } from "./headerComp";
import { ResizeFeature } from "./resizeFeature";
import { SelectAllFeature } from "./selectAllFeature";
import { getElementSize } from "../../../utils/dom";
import { SortDirection } from "../../../entities/colDef";
import { ColumnMoveHelper } from "../../columnMoveHelper";
import { HorizontalDirection } from "../../../constants/direction";
import { WithoutGridCommon } from "../../../interfaces/iCommon";
import { ColumnHeaderMouseOverEvent, ColumnHeaderMouseLeaveEvent } from "../../../events";
import { Beans } from "../../../rendering/beans";

export interface IHeaderCellComp extends IAbstractHeaderCellComp {
    setWidth(width: string): void;
    setAriaSort(sort?: ColumnSortState): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeader | undefined;
}

type HeaderAriaDescriptionKey = 'filter' | 'menu' | 'sort' | 'selectAll' | 'filterButton';

export class HeaderCellCtrl extends AbstractHeaderCellCtrl<IHeaderCellComp, Column, ResizeFeature> {

    private refreshFunctions: (() => void)[] = [];
    private selectAllFeature: SelectAllFeature;

    private sortable: boolean | null | undefined;
    private displayName: string | null;
    private draggable: boolean;
    private menuEnabled: boolean;
    private openFilterEnabled: boolean;
    private dragSourceElement: HTMLElement | undefined;

    private userCompDetails: UserCompDetails;

    private userHeaderClasses: Set<string> = new Set();
    private ariaDescriptionProperties = new Map<HeaderAriaDescriptionKey, string>();
    private tooltipFeature: TooltipFeature | undefined;

    constructor(column: Column, beans: Beans, parentRowCtrl: HeaderRowCtrl) {
        super(column, beans, parentRowCtrl);
        this.column = column;
    }

    public setComp(comp: IHeaderCellComp, eGui: HTMLElement, eResize: HTMLElement, eHeaderCompWrapper: HTMLElement): void {
        this.comp = comp;

        this.setGui(eGui);
        this.updateState();
        this.setupWidth();
        this.setupMovingCss();
        this.setupMenuClass();
        this.setupSortableClass();
        this.setupWrapTextClass();
        this.refreshSpanHeaderHeight();
        this.setupAutoHeight(eHeaderCompWrapper);
        this.addColumnHoverListener();
        this.setupFilterClass();
        this.setupClassesFromColDef();
        this.setupTooltip();
        this.addActiveHeaderMouseListeners();
        this.setupSelectAll();
        this.setupUserComp();
        this.refreshAria();

        this.resizeFeature = this.createManagedBean(new ResizeFeature(this.getPinned(), this.column, eResize, comp, this));
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

        this.addResizeAndMoveKeyboardListeners();

        this.addManagedPropertyListeners(['suppressMovableColumns', 'suppressMenuHide', 'suppressAggFuncInHeader'], this.refresh.bind(this));
        this.addManagedListener(this.column, Column.EVENT_COL_DEF_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    }

    protected resizeHeader(delta: number, shiftKey: boolean): void {
        if (!this.column.isResizable()) { return; }

        const actualWidth = this.column.getActualWidth();
        const minWidth = this.column.getMinWidth() ?? 0;
        const maxWidth = this.column.getMaxWidth() ?? Number.MAX_SAFE_INTEGER;
    
        const newWidth = Math.min(Math.max(actualWidth + delta, minWidth), maxWidth);

        this.beans.columnModel.setColumnWidths([{ key: this.column, newWidth }], shiftKey, true, 'uiColumnResized');
    }

    protected moveHeader(hDirection: HorizontalDirection): void {
        const { eGui, column, gos, ctrlsService } = this;
        const pinned = this.getPinned();
        const left = eGui.getBoundingClientRect().left;
        const width = column.getActualWidth();
        const isRtl = gos.get('enableRtl');
        const isLeft = hDirection === HorizontalDirection.Left !== isRtl;

        const xPosition = ColumnMoveHelper.normaliseX(
            isLeft ? (left - 20) : (left + width + 20),
            pinned,
            true,
            gos,
            ctrlsService
        );

        ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: [column],
            isFromHeader: true,
            hDirection,
            xPosition,
            pinned,
            fromEnter: false,
            fakeEvent: false,
            gos,
            columnModel: this.beans.columnModel
        });

        ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(column, 'auto');
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

        const params: IHeaderParams = this.gos.addGridCommonParams({
            column: this.column,
            displayName: this.displayName!,
            enableSorting: this.column.isSortable(),
            enableMenu: this.menuEnabled,
            enableFilterButton: this.openFilterEnabled && this.menuService.isHeaderFilterButtonEnabled(this.column),
            enableFilterIcon: !this.openFilterEnabled || this.menuService.isLegacyMenuEnabled(),
            showColumnMenu: (buttonElement: HTMLElement) => {
                this.menuService.showColumnMenu({
                    column: this.column,
                    buttonElement,
                    positionBy: 'button'
                });
            },
            showColumnMenuAfterMouseClick: (mouseEvent: MouseEvent | Touch) => {
                this.menuService.showColumnMenu({
                    column: this.column,
                    mouseEvent,
                    positionBy: 'mouse'
                });
            },
            showFilter: (buttonElement: HTMLElement) => {
                this.menuService.showFilterMenu({
                    column: this.column,
                    buttonElement: buttonElement,
                    containerType: 'columnFilter',
                    positionBy: 'button'
                })
            },
            progressSort: (multiSort?: boolean) => {
                this.beans.sortController.progressSort(this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: (sort: SortDirection, multiSort?: boolean) => {
                this.beans.sortController.setSortForColumn(this.column, sort, !!multiSort, "uiColumnSorted");
            },
            eGridHeader: this.getGui(),
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                this.setupTooltip(value, shouldDisplayTooltip);
            }
        });

        return params;
    }

    private setupSelectAll(): void {
        this.selectAllFeature = this.createManagedBean(new SelectAllFeature(this.column));
        this.selectAllFeature.setComp(this);
    }

    public getSelectAllGui(): HTMLElement {
        return this.selectAllFeature.getCheckboxGui();
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        if (e.key === KeyCode.SPACE) {
            this.selectAllFeature.onSpaceKeyDown(e);
        }
        if (e.key === KeyCode.ENTER) {
            this.onEnterKeyDown(e);
        }
        if (e.key === KeyCode.DOWN && e.altKey) {
            this.showMenuOnKeyPress(e, false);
        }
    }

    private onEnterKeyDown(e: KeyboardEvent): void {
        if (e.ctrlKey || e.metaKey) {
            this.showMenuOnKeyPress(e, true);
        } else if (this.sortable) {
            const multiSort = e.shiftKey;
            this.beans.sortController.progressSort(this.column, multiSort, "uiColumnSorted");
        }
    }

    private showMenuOnKeyPress(e: KeyboardEvent, isFilterShortcut: boolean): void {
        const headerComp = this.comp.getUserCompInstance();
        if (!headerComp || !(headerComp instanceof HeaderComp)) { return; }

        // the header comp knows what features are enabled, so let it handle the shortcut
        if (headerComp.onMenuKeyboardShortcut(isFilterShortcut)) {
            e.preventDefault();
        }
    }

    private onFocusIn(e: FocusEvent) {
        if (!this.getGui().contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.getRowIndex();
            this.focusService.setFocusedHeader(rowIndex, this.column);
            this.announceAriaDescription();
        }

        if (this.focusService.isKeyboardMode()) {
            this.setActiveHeader(true);
        }
    }

    private onFocusOut(e: FocusEvent) {
        if (
            this.getGui().contains(e.relatedTarget as HTMLElement)
        ) { return; }

        this.setActiveHeader(false);
    }

    private setupTooltip(value?: string, shouldDisplayTooltip?: () => boolean): void {
        if (this.tooltipFeature) {
            this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        }

        const isTooltipWhenTruncated = this.gos.get('tooltipShowMode') === 'whenTruncated';
        const eGui = this.eGui;
        const colDef = this.column.getColDef();

        if (!shouldDisplayTooltip && isTooltipWhenTruncated && !colDef.headerComponent) {
            shouldDisplayTooltip = () => {
                const textEl = eGui.querySelector('.ag-header-cell-text');
                if (!textEl) { return true; }

                return textEl.scrollWidth > textEl.clientWidth;
            }
        }

        const tooltipCtrl: ITooltipFeatureCtrl = {
            getColumn: () => this.column,
            getColDef: () => this.column.getColDef(),
            getGui: () => eGui,
            getLocation: () => 'header',
            getTooltipValue: () => {
                if (value != null) {
                    return value;
                }

                const res = this.column.getColDef().headerTooltip;
                return res;
            },
            shouldDisplayTooltip
        };

        const tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl));
        this.refreshFunctions.push(() => tooltipFeature.refreshToolTip());
    }

    private setupClassesFromColDef(): void {
        const refreshHeaderClasses = () => {
            const colDef = this.column.getColDef();
            const classes = CssClassApplier.getHeaderClassesFromColDef(colDef, this.gos, this.column, null);

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

        if (!eSource || !this.draggable) { return; }

        const { column, beans, displayName, dragAndDropService, gos } = this;
        const { columnModel } = beans;

        let hideColumnOnExit = !this.gos.get('suppressDragLeaveHidesColumns');
        const dragSource = this.dragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eSource,
            getDefaultIconName: () => hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: () => this.createDragItem(column),
            dragItemName: displayName,
            onDragStarted: () => {
                hideColumnOnExit = !gos.get('suppressDragLeaveHidesColumns');
                column.setMoving(true, "uiColumnMoved");
            },
            onDragStopped: () => column.setMoving(false, "uiColumnMoved"),
            onGridEnter: (dragItem) => {
                if (hideColumnOnExit) {
                    const unlockedColumns = dragItem?.columns?.filter(col => !col.getColDef().lockVisible) || [];
                    columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: (dragItem) => {
                if (hideColumnOnExit) {
                    const unlockedColumns = dragItem?.columns?.filter(col => !col.getColDef().lockVisible) || [];
                    columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };

        dragAndDropService.addDragSource(dragSource, true);
    }

    private createDragItem(column: Column): DragItem {
        const visibleState: { [key: string]: boolean; } = {};
        visibleState[column.getId()] = column.isVisible();

        return {
            columns: [column],
            visibleState: visibleState
        };
    }

    private updateState(): void {
        this.menuEnabled = this.menuService.isColumnMenuInHeaderEnabled(this.column);
        this.openFilterEnabled = this.menuService.isFilterMenuInHeaderEnabled(this.column);
        this.sortable = this.column.isSortable();
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
        return this.beans.columnModel.getDisplayNameForColumn(this.column, 'header', true);
    }

    private checkDisplayName(): void {
        // display name can change if aggFunc different, eg sum(Gold) is now max(Gold)
        if (this.displayName !== this.calculateDisplayName()) {
            this.refresh();
        }
    }

    private workOutDraggable(): boolean {
        const colDef = this.column.getColDef();
        const isSuppressMovableColumns = this.gos.get('suppressMovableColumns');

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
            const columnWidth = this.column.getActualWidth();
            this.comp.setWidth(`${columnWidth}px`);
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
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, this.refreshAriaSort.bind(this));
    }

    private setupFilterClass(): void {
        const listener = () => {
            const isFilterActive = this.column.isFilterActive();
            this.comp.addOrRemoveCssClass('ag-header-cell-filtered', isFilterActive);
            this.refreshAria();
        };

        this.addManagedListener(this.column, Column.EVENT_FILTER_ACTIVE_CHANGED, listener);
        listener();
    }

    private setupWrapTextClass() {
        const listener = () => {
            const wrapText = !!this.column.getColDef().wrapHeaderText;
            this.comp.addOrRemoveCssClass('ag-header-cell-wrap-text', wrapText);
        };
        listener();
        this.addRefreshFunction(listener);
    }

    protected onDisplayedColumnsChanged(): void {
        super.onDisplayedColumnsChanged();
        if (!this.isAlive()) { return; }
        this.onHeaderHeightChanged();
    }

    private onHeaderHeightChanged() {
        this.refreshSpanHeaderHeight();
    }

    private refreshSpanHeaderHeight() {
        const { eGui, column, comp, beans } = this;
        if (!column.isSpanHeaderHeight()) {
            eGui.style.removeProperty('top');
            eGui.style.removeProperty('height');
            comp.addOrRemoveCssClass('ag-header-span-height', false);
            comp.addOrRemoveCssClass('ag-header-span-total', false);
            return;
        }

        const { numberOfParents, isSpanningTotal } = this.column.getColumnGroupPaddingInfo();

        comp.addOrRemoveCssClass('ag-header-span-height', numberOfParents > 0);

        const { columnModel } = beans;

        const headerHeight = columnModel.getColumnHeaderRowHeight();
        if (numberOfParents === 0) {
            // if spanning has stopped then need to reset these values.
            comp.addOrRemoveCssClass('ag-header-span-total', false);
            eGui.style.setProperty('top', `0px`);
            eGui.style.setProperty('height', `${headerHeight}px`);
            return;
        }

        comp.addOrRemoveCssClass('ag-header-span-total', isSpanningTotal);

        const pivotMode = columnModel.isPivotMode();
        const groupHeaderHeight = pivotMode
            ? columnModel.getPivotGroupHeaderHeight()
            : columnModel.getGroupHeaderHeight();

        const extraHeight = numberOfParents * groupHeaderHeight;

        eGui.style.setProperty('top', `${-extraHeight}px`);
        eGui.style.setProperty('height', `${headerHeight + extraHeight}px`);
    }

    private setupAutoHeight(wrapperElement: HTMLElement) {
        const { columnModel, resizeObserverService } = this.beans;
        const measureHeight = (timesCalled: number) => {
            if (!this.isAlive()) { return; }

            const { paddingTop, paddingBottom, borderBottomWidth, borderTopWidth } = getElementSize(this.getGui());
            const extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;

            const wrapperHeight = wrapperElement.offsetHeight;
            const autoHeight = wrapperHeight + extraHeight;

            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = this.beans.gos.getDocument();
                const notYetInDom = !doc || !doc.contains(wrapperElement);

                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                const possiblyNoContentYet = autoHeight == 0;

                if (notYetInDom || possiblyNoContentYet) {
                    window.setTimeout(() => measureHeight(timesCalled + 1), 0);
                    return;
                }
            }
            columnModel.setColumnHeaderHeight(this.column, autoHeight);
        };

        let isMeasuring = false;
        let stopResizeObserver: (() => void) | undefined;

        const checkMeasuring = () => {
            const newValue = this.column.isAutoHeaderHeight();

            if (newValue && !isMeasuring) {
                startMeasuring();
            }
            if (!newValue && isMeasuring) {
                stopMeasuring();
            }
        };

        const startMeasuring = () => {
            isMeasuring = true;
            measureHeight(0);
            this.comp.addOrRemoveCssClass('ag-header-cell-auto-height', true);
            stopResizeObserver = resizeObserverService.observeResize(wrapperElement, () => measureHeight(0));
        };

        const stopMeasuring = () => {
            isMeasuring = false;
            if (stopResizeObserver) {
                stopResizeObserver();
            }
            this.comp.addOrRemoveCssClass('ag-header-cell-auto-height', false);
            stopResizeObserver = undefined;
        };

        checkMeasuring();

        this.addDestroyFunc(() => stopMeasuring());

        // In theory we could rely on the resize observer for everything - but since it's debounced
        // it can be a little janky for smooth movement. in this case its better to react to our own events
        // And unfortunately we cant _just_ rely on our own events, since custom components can change whenever
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, () => isMeasuring && measureHeight(0));
        // Displaying the sort icon changes the available area for text, so sort changes can affect height
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, () => {
            // Rendering changes for sort, happen after the event... not ideal
            if (isMeasuring) {
                window.setTimeout(() => measureHeight(0));
            }
        });
        this.addRefreshFunction(checkMeasuring);
    }

    private refreshAriaSort(): void {
        if (this.sortable) {
            const translate = this.localeService.getLocaleTextFunc();
            const sort = this.beans.sortController.getDisplaySortForColumn(this.column) || null;
            this.comp.setAriaSort(getAriaSortState(sort));
            this.setAriaDescriptionProperty('sort', translate('ariaSortableColumn', 'Press ENTER to sort'));
        } else {
            this.comp.setAriaSort();
            this.setAriaDescriptionProperty('sort', null);
        }
    }

    private refreshAriaMenu(): void {
        if (this.menuEnabled) {
            const translate = this.localeService.getLocaleTextFunc();
            this.setAriaDescriptionProperty('menu', translate('ariaMenuColumn', 'Press ALT DOWN to open column menu'));
        } else {
            this.setAriaDescriptionProperty('menu', null);
        }
    }

    private refreshAriaFilterButton(): void {
        if (this.openFilterEnabled && !this.menuService.isLegacyMenuEnabled()) {
            const translate = this.localeService.getLocaleTextFunc();
            this.setAriaDescriptionProperty('filterButton', translate('ariaFilterColumn', 'Press CTRL ENTER to open filter'));
        } else {
            this.setAriaDescriptionProperty('filterButton', null);
        }
    }

    private refreshAriaFiltered(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const isFilterActive = this.column.isFilterActive();
        if (isFilterActive) {
            this.setAriaDescriptionProperty('filter', translate('ariaColumnFiltered', 'Column Filtered'));
        } else {
            this.setAriaDescriptionProperty('filter', null);
        }
    }

    public setAriaDescriptionProperty(property: HeaderAriaDescriptionKey, value: string | null): void {
        if (value != null) {
            this.ariaDescriptionProperties.set(property, value);
        } else {
            this.ariaDescriptionProperties.delete(property);
        }
    }

    public announceAriaDescription(): void {
        if (!this.eGui.contains(this.beans.gos.getActiveDomElement())) { return; }
        const ariaDescription = 
            Array.from(this.ariaDescriptionProperties.keys())
                // always announce the filter description first
                .sort((a: string, b: string) => a === 'filter' ? - 1 : (b.charCodeAt(0) - a.charCodeAt(0)))
                .map((key: HeaderAriaDescriptionKey) => this.ariaDescriptionProperties.get(key))
                .join('. ');

        this.beans.ariaAnnouncementService.announceValue(ariaDescription);
    }

    private refreshAria(): void {
        this.refreshAriaSort();
        this.refreshAriaMenu();
        this.refreshAriaFilterButton();
        this.refreshAriaFiltered();
    }

    private addColumnHoverListener(): void {
        const listener = () => {
            if (!this.gos.get('columnHoverHighlight')) { return; }
            const isHovered = this.beans.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', isHovered);
        };

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }

    public getColId(): string {
        return this.column.getColId();
    }

    private addActiveHeaderMouseListeners(): void {
        const listener = (e: MouseEvent) => this.handleMouseOverChange(e.type === 'mouseenter');
        const clickListener = () => this.dispatchColumnMouseEvent(Events.EVENT_COLUMN_HEADER_CLICKED, this.column);
        const contextMenuListener = (event: MouseEvent) => this.handleContextMenuMouseEvent(event, undefined, this.column);

        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
        this.addManagedListener(this.getGui(), 'click', clickListener);
        this.addManagedListener(this.getGui(), 'contextmenu', contextMenuListener);
    }

    private handleMouseOverChange(isMouseOver: boolean): void {
        this.setActiveHeader(isMouseOver);
        const eventType = isMouseOver ?
            Events.EVENT_COLUMN_HEADER_MOUSE_OVER :
            Events.EVENT_COLUMN_HEADER_MOUSE_LEAVE;

        const event: WithoutGridCommon<ColumnHeaderMouseOverEvent> | WithoutGridCommon<ColumnHeaderMouseLeaveEvent> = {
            type: eventType,
            column: this.column,
        };

        this.eventService.dispatchEvent(event);
    }

    private setActiveHeader(active: boolean): void {
        this.comp.addOrRemoveCssClass('ag-header-active', active);
    }

    public getAnchorElementForMenu(isFilter?: boolean): HTMLElement {
        const headerComp = this.comp.getUserCompInstance();
        if (headerComp instanceof HeaderComp) {
            return headerComp.getAnchorElementForMenu(isFilter);
        }
        return this.getGui();
    }

    protected destroy(): void {
        super.destroy();

        (this.refreshFunctions as any) = null;
        (this.selectAllFeature as any) = null;
        (this.dragSourceElement as any) = null;
        (this.userCompDetails as any) = null;
        (this.userHeaderClasses as any) = null;
        (this.ariaDescriptionProperties as any) = null;
    }
}
