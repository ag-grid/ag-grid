import {Component} from "../../widgets/component";
import {Autowired, Context, PostConstruct} from "../../context/context";
import {Column} from "../../entities/column";
import {Utils as _} from "../../utils";
import {
    DragAndDropService, DragItem, DragSource, DragSourceType,
    DropTarget
} from "../../dragAndDrop/dragAndDropService";
import {IHeaderComp, IHeaderParams} from "./headerComp";
import {ColumnApi} from "../../columnController/columnApi";
import {ColumnController} from "../../columnController/columnController";
import {HorizontalResizeService} from "../horizontalResizeService";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {CssClassApplier} from "../cssClassApplier";
import {SetLeftFeature} from "../../rendering/features/setLeftFeature";
import {IMenuFactory} from "../../interfaces/iMenuFactory";
import {GridApi} from "../../gridApi";
import {SortController} from "../../sortController";
import {EventService} from "../../eventService";
import {ComponentRecipes} from "../../components/framework/componentRecipes";
import {AgCheckbox} from "../../widgets/agCheckbox";
import {RefSelector} from "../../widgets/componentAnnotations";
import {SelectAllFeature} from "./selectAllFeature";
import {Events} from "../../events";
import {ColumnHoverService} from "../../rendering/columnHoverService";
import {Beans} from "../../rendering/beans";
import {HoverFeature} from "../hoverFeature";
import {TouchListener} from "../../widgets/touchListener";

export class HeaderWrapperComp extends Component {

    private static TEMPLATE =
        '<div class="ag-header-cell" role="presentation" >' +
          '<div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>' +
          '<ag-checkbox ref="cbSelectAll" class="ag-header-select-all" role="presentation"></ag-checkbox>' +
            // <inner component goes here>
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('context') private context: Context;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;
    @Autowired('beans') private beans: Beans;

    @RefSelector('eResize') private eResize: HTMLElement;
    @RefSelector('cbSelectAll') private cbSelectAll: AgCheckbox;

    private column: Column;
    private dragSourceDropTarget: DropTarget;
    private pinned: string;

    private resizeStartWidth: number;
    private resizeWithShiftKey:  boolean;

    constructor(column: Column, dragSourceDropTarget: DropTarget, pinned: string) {
        super(HeaderWrapperComp.TEMPLATE);
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    public getColumn(): Column {
        return this.column;
    }

    @PostConstruct
    public init(): void {
        this.instantiate(this.context);

        let displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);
        let enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
        let enableMenu = this.menuFactory.isMenuEnabled(this.column) && !this.column.getColDef().suppressMenu;

        this.appendHeaderComp(displayName, enableSorting, enableMenu);

        this.setupWidth();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMenuClass();
        this.setupSortableClass(enableSorting);
        this.addColumnHoverListener();

        this.addFeature(this.context, new HoverFeature([this.column], this.getGui()));

        this.addDestroyableEventListener(this.column, Column.EVENT_FILTER_ACTIVE_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();

        this.addFeature(this.context, new SelectAllFeature(this.cbSelectAll, this.column));

        let setLeftFeature = new SetLeftFeature(this.column, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));

        this.addAttributes();
        CssClassApplier.addHeaderClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    }

    private addColumnHoverListener(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    }

    private onColumnHover(): void {
        let isHovered = this.columnHoverService.isHovered(this.column);
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered)
    }

    private setupSortableClass(enableSorting:boolean):void{
        if (enableSorting) {
            let element = this.getGui();
            _.addCssClass(element, 'ag-header-cell-sortable');
        }
    }

    private onFilterChanged(): void {
        let filterPresent = this.column.isFilterActive();
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
    }

    private appendHeaderComp(displayName: string, enableSorting: boolean, enableMenu: boolean): void {
        let params = <IHeaderParams> {
            column: this.column,
            displayName: displayName,
            enableSorting: enableSorting,
            enableMenu: enableMenu,
            showColumnMenu: (source:HTMLElement) => {
                this.gridApi.showColumnMenuAfterButtonClick(this.column, source)
            },
            progressSort: (multiSort?:boolean) => {
                this.sortController.progressSort(this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: (sort: string, multiSort?: boolean) => {
                this.sortController.setSortForColumn(this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };

        let callback = this.afterHeaderCompCreated.bind(this, displayName);

        this.componentRecipes.newHeaderComponent(params).then(callback);
    }

    private afterHeaderCompCreated(displayName: string, headerComp: IHeaderComp): void {
        this.appendChild(headerComp);
        this.setupMove(headerComp.getGui(), displayName);

        if (headerComp.destroy) {
            this.addDestroyFunc(headerComp.destroy.bind(headerComp));
        }
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
        let suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.column.getColDef().suppressMovable
            || this.column.isLockPosition();

        if (suppressMove) { return; }

        if (eHeaderCellLabel) {
            let dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                dragItemCallback: () => this.createDragItem(),
                dragItemName: displayName,
                dragSourceDropTarget: this.dragSourceDropTarget,
                dragStarted: () => this.column.setMoving(true, "uiColumnMoved"),
                dragStopped: () => this.column.setMoving(false, "uiColumnMoved")
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
        }
    }

    private createDragItem(): DragItem {
        let visibleState: { [key: string]: boolean } = {};
        visibleState[this.column.getId()] = this.column.isVisible();

        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    private setupResize(): void {
        let colDef = this.column.getColDef();

        // if no eResize in template, do nothing
        if (!this.eResize) {
            return;
        }

        if (!this.column.isResizable()) {
            _.removeFromParent(this.eResize);
            return;
        }

        let finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });

        this.addDestroyFunc(finishedWithResizeFunc);

        let weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            this.addDestroyableEventListener(this.eResize, 'dblclick', () => {
                this.columnController.autoSizeColumn(this.column, "uiColumnResized");
            });
            let touchListener: TouchListener = new TouchListener(this.eResize);
            this.addDestroyableEventListener(touchListener, TouchListener.EVENT_DOUBLE_TAP, ()=> {
                this.columnController.autoSizeColumn(this.column, "uiColumnResized");
            });
            this.addDestroyFunc(touchListener.destroy.bind(touchListener));
        }
    }

    public onResizing(finished: boolean, resizeAmount: number): void {
        let resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        let newWidth = this.resizeStartWidth + resizeAmountNormalised;
        this.columnController.setColumnWidth(this.column, newWidth, this.resizeWithShiftKey, finished, "uiColumnDragged");
    }

    public onResizeStart(shiftKey: boolean): void {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;
    }

    private setupTooltip(): void {
        let colDef = this.column.getColDef();

        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.getGui().title = colDef.headerTooltip;
        }
    }

    private setupMovingCss(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    }

    private addAttributes(): void {
        this.getGui().setAttribute("col-id", this.column.getColId());
    }

    private setupWidth(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private setupMenuClass(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_MENU_VISIBLE_CHANGED, this.onMenuVisible.bind(this));
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
            if (this.pinned !== Column.PINNED_LEFT) {
                result *= -1;
            }
        } else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (this.pinned === Column.PINNED_RIGHT) {
                result *= -1;
            }
        }
        return result;
    }

}
