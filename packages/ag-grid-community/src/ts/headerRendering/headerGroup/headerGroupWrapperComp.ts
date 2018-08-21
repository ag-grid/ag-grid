import {Component} from "../../widgets/component";
import {Column} from "../../entities/column";
import {Utils as _} from "../../utils";
import {ColumnGroup} from "../../entities/columnGroup";
import {ColumnApi} from "../../columnController/columnApi";
import {ColumnController, ColumnResizeSet} from "../../columnController/columnController";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {HorizontalResizeService} from "../horizontalResizeService";
import {Autowired, Context, PostConstruct} from "../../context/context";
import {CssClassApplier} from "../cssClassApplier";
import {
    DragAndDropService,
    DragItem,
    DragSource,
    DragSourceType,
    DropTarget
} from "../../dragAndDrop/dragAndDropService";
import {SetLeftFeature} from "../../rendering/features/setLeftFeature";
import {IHeaderGroupComp, IHeaderGroupParams} from "./headerGroupComp";
import {GridApi} from "../../gridApi";
import {ComponentRecipes} from "../../components/framework/componentRecipes";
import {Beans} from "../../rendering/beans";
import {HoverFeature} from "../hoverFeature";
import {ColumnEventType} from "../../events";

export class HeaderGroupWrapperComp extends Component {

    private static TEMPLATE =
        '<div class="ag-header-group-cell">' +
          '<div ref="agResize" class="ag-header-cell-resize"></div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('context') private context: Context;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
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

        CssClassApplier.addHeaderClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);

        let displayName = this.columnController.getDisplayNameForColumnGroup(this.columnGroup, 'header');

        this.appendHeaderGroupComp(displayName);

        this.setupResize();
        this.addClasses();
        this.setupWidth();
        this.addAttributes();
        this.setupMovingCss();
        this.setupTooltip();

        this.addFeature(this.context, new HoverFeature(this.columnGroup.getOriginalColumnGroup().getLeafColumns(), this.getGui()));

        let setLeftFeature = new SetLeftFeature(this.columnGroup, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
    }

    private setupMovingCss(): void {
        let originalColumnGroup = this.columnGroup.getOriginalColumnGroup();
        let leafColumns = originalColumnGroup.getLeafColumns();
        leafColumns.forEach( col => {
            this.addDestroyableEventListener(col, Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        });
        this.onColumnMovingChanged();
    }

    private setupTooltip(): void {
        let colGroupDef = this.columnGroup.getColGroupDef();

        // add tooltip if exists
        if (colGroupDef && colGroupDef.headerTooltip) {
            this.getGui().title = colGroupDef.headerTooltip;
        }
    }

    private onColumnMovingChanged(): void {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.columnGroup.isMoving()) {
            _.addCssClass(this.getGui(), 'ag-header-cell-moving');
        } else {
            _.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    }

    private addAttributes(): void {
        this.getGui().setAttribute("col-id", this.columnGroup.getUniqueId());
    }

    private appendHeaderGroupComp(displayName: string): void {
        let params: IHeaderGroupParams = {
            displayName: displayName,
            columnGroup: this.columnGroup,
            setExpanded: (expanded:boolean)=>{
                this.columnController.setColumnGroupOpened(this.columnGroup.getOriginalColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };

        if(!displayName) {
            let leafCols = this.columnGroup.getLeafColumns();
            displayName = leafCols ? leafCols[0].getColDef().headerName : '';
        }

        let callback = this.afterHeaderCompCreated.bind(this, displayName);

        this.componentRecipes.newHeaderGroupComponent(params).then(callback);
    }

    private afterHeaderCompCreated(displayName: string, headerGroupComp: IHeaderGroupComp): void {
        this.appendChild(headerGroupComp);
        this.setupMove(headerGroupComp.getGui(), displayName);

        if (headerGroupComp.destroy) {
            this.addDestroyFunc(headerGroupComp.destroy.bind(headerGroupComp));
        }
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

        let allLeafColumns = this.columnGroup.getOriginalColumnGroup().getLeafColumns();

        if (eHeaderGroup) {
            let dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderGroup,
                dragItemName: displayName,
                // we add in the original group leaf columns, so we move both visible and non-visible items
                dragItemCallback: this.getDragItemForGroup.bind(this),
                dragSourceDropTarget: this.dragSourceDropTarget,
                dragStarted: () => allLeafColumns.forEach( col => col.setMoving(true, "uiColumnDragged") ),
                dragStopped: () => allLeafColumns.forEach( col => col.setMoving(false, "uiColumnDragged") )
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
        }
    }

    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    public getDragItemForGroup(): DragItem {
        let allColumnsOriginalOrder = this.columnGroup.getOriginalColumnGroup().getLeafColumns();

        // capture visible state, used when reentering grid to dictate which columns should be visible
        let visibleState: { [key: string]: boolean } = {};
        allColumnsOriginalOrder.forEach(column => visibleState[column.getId()] = column.isVisible());

        let allColumnsCurrentOrder: Column[] = [];
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
        this.columnGroup.getLeafColumns().forEach( (column: Column) => {
            if (column.getColDef().suppressMovable || column.isLockPosition()) {
                childSuppressesMoving = true;
            }
        });

        let result = childSuppressesMoving || this.gridOptionsWrapper.isSuppressMovableColumns();

        return result;
    }

    private setupWidth(): void {

        // we need to listen to changes in child columns, as they impact our width
        this.addListenersToChildrenColumns();

        // the children belonging to this group can change, so we need to add and remove listeners as they change
        this.addDestroyableEventListener(this.columnGroup, ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));

        this.onWidthChanged();

        // the child listeners are not tied to this components lifecycle, as children can get added and removed
        // to the group - hence they are on a different lifecycle. so we must make sure the existing children
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
        let widthChangedListener = this.onWidthChanged.bind(this);
        this.columnGroup.getLeafColumns().forEach( column => {
            column.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            column.addEventListener(Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            this.childColumnsDestroyFuncs.push( ()=> {
                column.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            });
        });
    }

    private destroyListenersOnChildrenColumns(): void {
        this.childColumnsDestroyFuncs.forEach( func => func() );
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

        let finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eHeaderCellResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);

        if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
            this.eHeaderCellResize.addEventListener('dblclick', (event:MouseEvent) => {
                // get list of all the column keys we are responsible for
                let keys: string[] = [];
                this.columnGroup.getDisplayedLeafColumns().forEach( (column: Column)=>{
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length>0) {
                    this.columnController.autoSizeColumns(keys, "uiColumnResized");
                }
            });
        }
    }

    public onResizeStart(shiftKey: boolean): void {

        let leafCols = this.columnGroup.getDisplayedLeafColumns();
        this.resizeCols = _.filter(leafCols, col => col.isResizable());
        this.resizeStartWidth = 0;
        this.resizeCols.forEach( col => this.resizeStartWidth += col.getActualWidth());
        this.resizeRatios = [];
        this.resizeCols.forEach( col => this.resizeRatios.push(col.getActualWidth() / this.resizeStartWidth));

        let takeFromGroup: ColumnGroup = null;
        if (shiftKey) {
            takeFromGroup = this.columnController.getDisplayedGroupAfter(this.columnGroup);
        }

        if (takeFromGroup) {
            let takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();

            this.resizeTakeFromCols = _.filter(takeFromLeafCols, col => col.isResizable());

            this.resizeTakeFromStartWidth = 0;
            this.resizeTakeFromCols.forEach( col => this.resizeTakeFromStartWidth += col.getActualWidth());
            this.resizeTakeFromRatios = [];
            this.resizeTakeFromCols.forEach( col => this.resizeTakeFromRatios.push(col.getActualWidth() / this.resizeTakeFromStartWidth));
        } else {
            this.resizeTakeFromCols = null;
            this.resizeTakeFromStartWidth = null;
            this.resizeTakeFromRatios = null;
        }

    }

    public onResizing(finished: boolean, resizeAmount: any): void {

        let resizeSets: ColumnResizeSet[] = [];

        let resizeAmountNormalised = this.normaliseDragChange(resizeAmount);

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
