import { AgCheckbox } from "../../widgets/agCheckbox";
import { Autowired } from "../../context/context";
import { Beans } from "../../rendering/beans";
import { Column } from "../../entities/column";
import {
    DragAndDropService, DragItem, DragSource, DragSourceType,
    DropTarget
} from "../../dragAndDrop/dragAndDropService";
import { ColDef } from "../../entities/colDef";
import { Constants } from "../../constants";
import { ColumnApi } from "../../columnController/columnApi";
import { ColumnController } from "../../columnController/columnController";
import { ColumnHoverService } from "../../rendering/columnHoverService";
import { CssClassApplier } from "../cssClassApplier";
import { Events } from "../../events";
import { IHeaderComp, IHeaderParams, HeaderComp } from "./headerComp";
import { IMenuFactory } from "../../interfaces/iMenuFactory";
import { GridApi } from "../../gridApi";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { HorizontalResizeService } from "../horizontalResizeService";
import { HoverFeature } from "../hoverFeature";
import { SetLeftFeature } from "../../rendering/features/setLeftFeature";
import { SortController } from "../../sortController";
import { SelectAllFeature } from "./selectAllFeature";
import { RefSelector } from "../../widgets/componentAnnotations";
import { TouchListener } from "../../widgets/touchListener";
import { TooltipFeature } from "../../widgets/tooltipFeature";
import { UserComponentFactory } from "../../components/framework/userComponentFactory";
import { AbstractHeaderWrapper } from "./abstractHeaderWrapper";
import { HeaderRowComp } from "../headerRowComp";
import { _ } from "../../utils";

export class HeaderWrapperComp extends AbstractHeaderWrapper {

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell" role="columnheader" unselectable="on" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
            <ag-checkbox ref="cbSelectAll" class="ag-header-select-all" role="presentation"></ag-checkbox>
        </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;
    @Autowired('beans') protected beans: Beans;

    @RefSelector('eResize') private eResize: HTMLElement;
    @RefSelector('cbSelectAll') private cbSelectAll: AgCheckbox;

    private readonly dragSourceDropTarget: DropTarget;
    protected readonly column: Column;
    protected readonly pinned: string;

    private headerComp: IHeaderComp;
    private resizeStartWidth: number;
    private resizeWithShiftKey: boolean;
    private sortable: boolean;
    private menuEnabled: boolean;

    constructor(column: Column, dragSourceDropTarget: DropTarget, pinned: string) {
        super(HeaderWrapperComp.TEMPLATE);
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    protected postConstruct(): void {
        super.postConstruct();

        const colDef = this.getComponentHolder();
        const displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);
        const enableSorting = colDef.sortable;
        const enableMenu = this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;

        this.appendHeaderComp(displayName, enableSorting, enableMenu);
        this.setupWidth();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMenuClass();
        this.setupSortableClass(enableSorting);
        this.addColumnHoverListener();
        this.addDisplayMenuListeners();
        this.cbSelectAll.setInputAriaLabel('Toggle Selection of All Rows');

        this.createManagedBean(new HoverFeature([this.column], this.getGui()));

        this.addManagedListener(this.column, Column.EVENT_FILTER_ACTIVE_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();

        this.createManagedBean(new SelectAllFeature(this.cbSelectAll, this.column));

        const setLeftFeature = new SetLeftFeature(this.column, this.getGui(), this.beans);
        this.createManagedBean(setLeftFeature);

        this.addAttributes();
        CssClassApplier.addHeaderClassesFromColDef(colDef, this.getGui(), this.gridOptionsWrapper, this.column, null);
    }

    private addDisplayMenuListeners(): void {
        const mouseListener = this.onMouseOverOut.bind(this);
        this.addGuiEventListener('mouseenter', mouseListener);
        this.addGuiEventListener('mouseleave', mouseListener);
    }

    private onMouseOverOut(e: MouseEvent): void {
        if (this.headerComp && this.headerComp.setActiveParent) {
            this.headerComp.setActiveParent(e.type === 'mouseenter');
        }
    }

    protected onFocusIn(e: FocusEvent) {
        if (!this.getGui().contains(e.relatedTarget as HTMLElement)) {
            const headerRow = this.getParentComponent() as HeaderRowComp;
            this.focusController.setFocusedHeader(
                headerRow.getRowIndex(),
                this.getColumn()
            );
        }

        if (this.headerComp && this.headerComp.setActiveParent) {
            this.headerComp.setActiveParent(true);
        }
    }

    protected onFocusOut(e: FocusEvent) {
        if (
            !this.headerComp ||
            !this.headerComp.setActiveParent ||
            this.getGui().contains(e.relatedTarget as HTMLElement)
        ) { return; }

        this.headerComp.setActiveParent(false);
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        const headerComp = this.headerComp as HeaderComp;
        if (!headerComp) { return; }

        if (e.keyCode === Constants.KEY_SPACE) {
            const checkbox = this.cbSelectAll;
            if (checkbox.isDisplayed() && !checkbox.getGui().contains(document.activeElement)) {
                checkbox.setValue(!checkbox.getValue());
            }
        }

        if (e.keyCode === Constants.KEY_ENTER) {
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
    }

    public getComponentHolder(): ColDef {
        return this.column.getColDef();
    }

    private addColumnHoverListener(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    }

    private onColumnHover(): void {
        const isHovered = this.columnHoverService.isHovered(this.column);
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    }

    private setupSortableClass(enableSorting: boolean): void {
        if (!enableSorting) { return; }

        const element = this.getGui();
        _.addCssClass(element, 'ag-header-cell-sortable');
        this.sortable = true;
    }

    private onFilterChanged(): void {
        const filterPresent = this.column.isFilterActive();
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
    }

    private appendHeaderComp(displayName: string, enableSorting: boolean, enableMenu: boolean): void {
        const params = {
            column: this.column,
            displayName: displayName,
            enableSorting: enableSorting,
            enableMenu: enableMenu,
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
            context: this.gridOptionsWrapper.getContext()
        } as IHeaderParams;

        const callback = this.afterHeaderCompCreated.bind(this, displayName);

        this.userComponentFactory.newHeaderComponent(params).then(callback);
    }

    private afterHeaderCompCreated(displayName: string, headerComp: IHeaderComp): void {
        this.getGui().appendChild(headerComp.getGui());
        this.addDestroyFunc(() => {
            this.getContext().destroyBean(headerComp);
        });

        this.setupMove(headerComp.getGui(), displayName);
        this.headerComp = headerComp;
    }

    private onColumnMovingChanged(): void {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.column.isMoving()) {
            _.addCssClass(this.getGui(), 'ag-header-cell-moving');
        } else {
            _.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    }

    private setupMove(eHeaderCellLabel: HTMLElement, displayName: string): void {
        const colDef = this.column.getColDef();
        const suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.getComponentHolder().suppressMovable
            || colDef.lockPosition;

        if (
            suppressMove &&
            !colDef.enableRowGroup &&
            !colDef.enablePivot
        ) { return; }

        if (eHeaderCellLabel) {
            const dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                defaultIconName: DragAndDropService.ICON_HIDE,
                getDragItem: () => this.createDragItem(),
                dragItemName: displayName,
                dragSourceDropTarget: this.dragSourceDropTarget,
                onDragStarted: () => !suppressMove && this.column.setMoving(true, "uiColumnMoved"),
                onDragStopped: () => !suppressMove && this.column.setMoving(false, "uiColumnMoved")
            };

            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
        }
    }

    private createDragItem(): DragItem {
        const visibleState: { [key: string]: boolean } = {};
        visibleState[this.column.getId()] = this.column.isVisible();

        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    private setupResize(): void {
        const colDef = this.getComponentHolder();

        // if no eResize in template, do nothing
        if (!this.eResize) { return; }

        if (!this.column.isResizable()) {
            _.removeFromParent(this.eResize);
            return;
        }

        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });

        this.addDestroyFunc(finishedWithResizeFunc);

        const weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        const skipHeaderOnAutoSize = this.gridOptionsWrapper.isSkipHeaderOnAutoSize();

        if (weWantAutoSize) {
            this.addManagedListener(this.eResize, 'dblclick', () => {
                this.columnController.autoSizeColumn(this.column, skipHeaderOnAutoSize, "uiColumnResized");
            });

            const touchListener: TouchListener = new TouchListener(this.eResize);

            this.addManagedListener(touchListener, TouchListener.EVENT_DOUBLE_TAP, () => {
                this.columnController.autoSizeColumn(this.column, skipHeaderOnAutoSize, "uiColumnResized");
            });

            this.addDestroyFunc(touchListener.destroy.bind(touchListener));
        }
    }

    public onResizing(finished: boolean, resizeAmount: number): void {
        const resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        const columnWidths = [{key: this.column, newWidth: this.resizeStartWidth + resizeAmountNormalised}];
        this.columnController.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, "uiColumnDragged");

        if (finished) {
            _.removeCssClass(this.getGui(), 'ag-column-resizing');
        }
    }

    public onResizeStart(shiftKey: boolean): void {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;

        _.addCssClass(this.getGui(), 'ag-column-resizing');
    }

    public getTooltipText(): string | undefined {
        const colDef = this.getComponentHolder();

        return colDef.headerTooltip;
    }

    private setupTooltip(): void {
        const tooltipText = this.getTooltipText();

        // add tooltip if exists
        if (tooltipText == null) { return; }

        if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
            this.getGui().setAttribute('title', tooltipText);
        } else {
            this.createManagedBean(new TooltipFeature(this, 'header'));
        }
    }

    private setupMovingCss(): void {
        this.addManagedListener(this.column, Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    }

    private addAttributes(): void {
        this.getGui().setAttribute("col-id", this.column.getColId());
    }

    private setupWidth(): void {
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private setupMenuClass(): void {
        this.addManagedListener(this.column, Column.EVENT_MENU_VISIBLE_CHANGED, this.onMenuVisible.bind(this));
        this.onColumnWidthChanged();
    }

    private onMenuVisible(): void {
        this.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    private normaliseResizeAmount(dragChange: number): number {
        let result = dragChange;

        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== Constants.PINNED_LEFT) {
                result *= -1;
            }
        } else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (this.pinned === Constants.PINNED_RIGHT) {
                result *= -1;
            }
        }

        return result;
    }
}
