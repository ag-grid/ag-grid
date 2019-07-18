import { ColGroupDef } from "../../entities/colDef";
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { ColumnApi } from "../../columnController/columnApi";
import { ColumnController, ColumnResizeSet } from "../../columnController/columnController";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { HorizontalResizeService } from "../horizontalResizeService";
import { Autowired, Context, PostConstruct } from "../../context/context";
import { CssClassApplier } from "../cssClassApplier";
import {
    DragAndDropService,
    DragItem,
    DragSource,
    DragSourceType,
    DropTarget
} from "../../dragAndDrop/dragAndDropService";
import { SetLeftFeature } from "../../rendering/features/setLeftFeature";
import { IHeaderGroupComp, IHeaderGroupParams } from "./headerGroupComp";
import { GridApi } from "../../gridApi";
import { UserComponentFactory } from "../../components/framework/userComponentFactory";
import { Beans } from "../../rendering/beans";
import { HoverFeature } from "../hoverFeature";
import { _ } from "../../utils";

export class HeaderGroupWrapperComp extends Component {

    private static TEMPLATE =
        '<div class="ag-header-group-cell">' +
          '<div ref="agResize" class="ag-header-cell-resize"></div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('beans') private beans: Beans;

    private readonly columnGroup: ColumnGroup;
    private readonly dragSourceDropTarget: DropTarget;
    private readonly pinned: string;

    private eHeaderCellResize: HTMLElement;

    private resizeCols: Column[];
    private resizeStartWidth: number;
    private resizeRatios: number[];

    private resizeTakeFromCols: Column[];
    private resizeTakeFromStartWidth: number;
    private resizeTakeFromRatios: number[];

    // the children can change, we keep destroy functions related to listening to the children here
    private childColumnsDestroyFuncs: Function[] = [];

    constructor(columnGroup: ColumnGroup, dragSourceDropTarget: DropTarget, pinned: string) {
        super(HeaderGroupWrapperComp.TEMPLATE);
        this.columnGroup = columnGroup;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    @PostConstruct
    private postConstruct(): void {

        CssClassApplier.addHeaderClassesFromColDef(this.getComponentHolder(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);

        const displayName = this.columnController.getDisplayNameForColumnGroup(this.columnGroup, 'header');

        this.appendHeaderGroupComp(displayName);

        this.setupResize();
        this.addClasses();
        this.setupWidth();
        this.addAttributes();
        this.setupMovingCss();
        this.setupTooltip();

        this.addFeature(this.getContext(), new HoverFeature(this.columnGroup.getOriginalColumnGroup().getLeafColumns(), this.getGui()));

        const setLeftFeature = new SetLeftFeature(this.columnGroup, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
    }

    private setupMovingCss(): void {
        const originalColumnGroup = this.columnGroup.getOriginalColumnGroup();
        const leafColumns = originalColumnGroup.getLeafColumns();
        leafColumns.forEach(col => {
            this.addDestroyableEventListener(col, Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        });
        this.onColumnMovingChanged();
    }

    public getColumn(): ColumnGroup {
        return this.columnGroup;
    }

    public getComponentHolder(): ColGroupDef {
        return this.columnGroup.getColGroupDef();
    }

    public getTooltipText(): string | undefined {
        const colGroupDef = this.getComponentHolder();

        return colGroupDef && colGroupDef.headerTooltip;
    }

    private setupTooltip(): void {
        const tooltipText = this.getTooltipText();

        if (tooltipText == null) { return; }

        if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
            this.getGui().setAttribute('title', tooltipText);
        } else {
            this.beans.tooltipManager.registerTooltip(this);
        }
    }

    private onColumnMovingChanged(): void {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-moving', this.columnGroup.isMoving());
    }

    private addAttributes(): void {
        this.getGui().setAttribute("col-id", this.columnGroup.getUniqueId());
    }

    private appendHeaderGroupComp(displayName: string): void {
        const params: IHeaderGroupParams = {
            displayName: displayName,
            columnGroup: this.columnGroup,
            setExpanded: (expanded:boolean) => {
                this.columnController.setColumnGroupOpened(this.columnGroup.getOriginalColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };

        if (!displayName) {
            let columnGroup = this.columnGroup;
            const leafCols = columnGroup.getLeafColumns();

            // find the top most column group that represents the same columns. so if we are dragging a group, we also
            // want to visually show the parent groups dragging for the same column set. for example imaging 5 levels
            // of grouping, with each group only containing the next group, and the last group containing three columns,
            // then when you move any group (even the lowest level group) you are in-fact moving all the groups, as all
            // the groups represent the same column set.
            while (columnGroup.getParent() && columnGroup.getParent().getLeafColumns().length === leafCols.length) {
                columnGroup = columnGroup.getParent();
            }

            const colGroupDef = columnGroup.getColGroupDef();
            if (colGroupDef) {
                displayName = colGroupDef.headerName;
            }

            if (!displayName) {
                displayName = leafCols ? this.columnController.getDisplayNameForColumn(leafCols[0], 'header', true) : '';
            }
        }

        const callback = this.afterHeaderCompCreated.bind(this, displayName);

        this.userComponentFactory.newHeaderGroupComponent(params).then(callback);
    }

    private afterHeaderCompCreated(displayName: string, headerGroupComp: IHeaderGroupComp): void {
        this.appendChild(headerGroupComp);
        this.setupMove(headerGroupComp.getGui(), displayName);
    }

    private addClasses(): void {
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        // columnGroup.getColGroupDef
        if (this.columnGroup.isPadding()) {
            this.addCssClass('ag-header-group-cell-no-group');
        } else {
            this.addCssClass('ag-header-group-cell-with-group');
        }
    }

    private setupMove(eHeaderGroup: HTMLElement, displayName: string): void {
        if (!eHeaderGroup) { return; }

        if (this.isSuppressMoving()) { return; }

        const allLeafColumns = this.columnGroup.getOriginalColumnGroup().getLeafColumns();

        if (eHeaderGroup) {
            const dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderGroup,
                dragItemName: displayName,
                // we add in the original group leaf columns, so we move both visible and non-visible items
                dragItemCallback: this.getDragItemForGroup.bind(this),
                dragSourceDropTarget: this.dragSourceDropTarget,
                dragStarted: () => allLeafColumns.forEach(col => col.setMoving(true, "uiColumnDragged")),
                dragStopped: () => allLeafColumns.forEach(col => col.setMoving(false, "uiColumnDragged"))
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
        }
    }

    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    public getDragItemForGroup(): DragItem {
        const allColumnsOriginalOrder = this.columnGroup.getOriginalColumnGroup().getLeafColumns();

        // capture visible state, used when re-entering grid to dictate which columns should be visible
        const visibleState: { [key: string]: boolean } = {};
        allColumnsOriginalOrder.forEach(column => visibleState[column.getId()] = column.isVisible());

        const allColumnsCurrentOrder: Column[] = [];
        this.columnController.getAllDisplayedColumns().forEach(column => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                _.removeFromArray(allColumnsOriginalOrder, column);
            }
        });

        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach(column => allColumnsCurrentOrder.push(column));

        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
            visibleState: visibleState
        };
    }

    private isSuppressMoving(): boolean {
        // if any child is fixed, then don't allow moving
        let childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach((column: Column) => {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });

        const result = childSuppressesMoving || this.gridOptionsWrapper.isSuppressMovableColumns();

        return result;
    }

    private setupWidth(): void {

        // we need to listen to changes in child columns, as they impact our width
        this.addListenersToChildrenColumns();

        // the children belonging to this group can change, so we need to add and remove listeners as they change
        this.addDestroyableEventListener(this.columnGroup, ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));

        this.onWidthChanged();

        // the child listeners are not tied to this components life-cycle, as children can get added and removed
        // to the group - hence they are on a different life-cycle. so we must make sure the existing children
        // listeners are removed when we finally get destroyed
        this.addDestroyFunc(this.destroyListenersOnChildrenColumns.bind(this));
    }

    private onDisplayedChildrenChanged(): void {
        this.addListenersToChildrenColumns();
        this.onWidthChanged();
    }

    private addListenersToChildrenColumns(): void {
        // first destroy any old listeners
        this.destroyListenersOnChildrenColumns();

        // now add new listeners to the new set of children
        const widthChangedListener = this.onWidthChanged.bind(this);
        this.columnGroup.getLeafColumns().forEach(column => {
            column.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            column.addEventListener(Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            this.childColumnsDestroyFuncs.push(() => {
                column.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            });
        });
    }

    private destroyListenersOnChildrenColumns(): void {
        this.childColumnsDestroyFuncs.forEach(func => func());
        this.childColumnsDestroyFuncs = [];
    }

    private onWidthChanged(): void {
        this.getGui().style.width = this.columnGroup.getActualWidth() + 'px';
    }

    private setupResize(): void {
        this.eHeaderCellResize = this.getRefElement('agResize');

        if (!this.columnGroup.isResizable()) {
            _.removeFromParent(this.eHeaderCellResize);
            return;
        }

        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eHeaderCellResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);

        if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
            this.eHeaderCellResize.addEventListener('dblclick', (event:MouseEvent) => {
                // get list of all the column keys we are responsible for
                const keys: string[] = [];
                this.columnGroup.getDisplayedLeafColumns().forEach((column: Column) => {
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length > 0) {
                    this.columnController.autoSizeColumns(keys, "uiColumnResized");
                }
            });
        }
    }

    public onResizeStart(shiftKey: boolean): void {

        const leafCols = this.columnGroup.getDisplayedLeafColumns();
        this.resizeCols = _.filter(leafCols, col => col.isResizable());
        this.resizeStartWidth = 0;
        this.resizeCols.forEach(col => this.resizeStartWidth += col.getActualWidth());
        this.resizeRatios = [];
        this.resizeCols.forEach(col => this.resizeRatios.push(col.getActualWidth() / this.resizeStartWidth));

        let takeFromGroup: ColumnGroup = null;
        if (shiftKey) {
            takeFromGroup = this.columnController.getDisplayedGroupAfter(this.columnGroup);
        }

        if (takeFromGroup) {
            const takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();

            this.resizeTakeFromCols = _.filter(takeFromLeafCols, col => col.isResizable());

            this.resizeTakeFromStartWidth = 0;
            this.resizeTakeFromCols.forEach(col => this.resizeTakeFromStartWidth += col.getActualWidth());
            this.resizeTakeFromRatios = [];
            this.resizeTakeFromCols.forEach(col => this.resizeTakeFromRatios.push(col.getActualWidth() / this.resizeTakeFromStartWidth));
        } else {
            this.resizeTakeFromCols = null;
            this.resizeTakeFromStartWidth = null;
            this.resizeTakeFromRatios = null;
        }

        _.addCssClass(this.getGui(), 'ag-column-resizing');

    }

    public onResizing(finished: boolean, resizeAmount: any): void {

        const resizeSets: ColumnResizeSet[] = [];

        const resizeAmountNormalised = this.normaliseDragChange(resizeAmount);

        resizeSets.push({
            columns: this.resizeCols,
            ratios: this.resizeRatios,
            width: this.resizeStartWidth + resizeAmountNormalised
        });

        if (this.resizeTakeFromCols) {
            resizeSets.push({
                columns: this.resizeTakeFromCols,
                ratios: this.resizeTakeFromRatios,
                width: this.resizeTakeFromStartWidth - resizeAmountNormalised
            });
        }

        this.columnController.resizeColumnSets(resizeSets, finished, 'uiColumnDragged');

        if (finished) {
            _.removeCssClass(this.getGui(), 'ag-column-resizing');
        }
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    private normaliseDragChange(dragChange: number): number {
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
