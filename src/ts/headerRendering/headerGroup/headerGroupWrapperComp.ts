
import {Component} from "../../widgets/component";
import {Column} from "../../entities/column";
import {Utils as _} from "../../utils";
import {ColumnGroup} from "../../entities/columnGroup";
import {ColumnApi, ColumnController} from "../../columnController/columnController";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {HorizontalDragService} from "../horizontalDragService";
import {Autowired, PostConstruct, Context} from "../../context/context";
import {CssClassApplier} from "../cssClassApplier";
import {DragSource, DropTarget, DragAndDropService, DragSourceType} from "../../dragAndDrop/dragAndDropService";
import {SetLeftFeature} from "../../rendering/features/setLeftFeature";
import {IHeaderGroupParams, IHeaderGroupComp} from "./headerGroupComp";
import {IComponent} from "../../interfaces/iComponent";
import {ComponentProvider} from "../../componentProvider";
import {GridApi} from "../../gridApi";

export class HeaderGroupWrapperComp extends Component {

    private static TEMPLATE =
        '<div class="ag-header-group-cell">' +
          '<div ref="agResize" class="ag-header-cell-resize"></div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('horizontalDragService') private dragService: HorizontalDragService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('context') private context: Context;
    @Autowired('componentProvider') private componentProvider:ComponentProvider;
    @Autowired('gridApi') private gridApi:GridApi;
    @Autowired('columnApi') private columnApi:ColumnApi;

    private columnGroup: ColumnGroup;
    private dragSourceDropTarget: DropTarget;
    private pinned: string;
    private eRoot: HTMLElement;

    private eHeaderCellResize: HTMLElement;
    private groupWidthStart: number;
    private childrenWidthStarts: number[];

    // the children can change, we keep destroy functions related to listening to the children here
    private childColumnsDestroyFuncs: Function[] = [];

    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string) {
        super(HeaderGroupWrapperComp.TEMPLATE);
        this.columnGroup = columnGroup;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    @PostConstruct
    private postConstruct(): void {

        CssClassApplier.addHeaderClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);

        let displayName = this.columnController.getDisplayNameForColumnGroup(this.columnGroup, 'header');

        let headerComponent: IHeaderGroupComp = this.appendHeaderGroupComp(displayName);

        this.setupResize();
        this.addClasses();
        this.setupMove(headerComponent.getGui(), displayName);
        this.setupWidth();
        this.addAttributes();

        this.addFeature(this.context, new SetLeftFeature(this.columnGroup, this.getGui()));
    }

    private addAttributes(): void {
        this.getGui().setAttribute("colId", this.columnGroup.getUniqueId());
    }

    private appendHeaderGroupComp(displayName: string): IHeaderGroupComp {
        let params: IHeaderGroupParams = {
            displayName: displayName,
            columnGroup: this.columnGroup,
            setExpanded: (expanded:boolean)=>{
                this.columnController.setColumnGroupOpened(this.columnGroup, expanded);
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        let headerComp = this.componentProvider.newHeaderGroupComponent(params);
        this.appendChild(headerComp);
        return headerComp;
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

        if (eHeaderGroup) {
            var dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderGroup,
                dragItemName: displayName,
                // we add in the original group leaf columns, so we move both visible and non-visible items
                dragItem: this.getAllColumnsInThisGroup(),
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
        }
    }

    // when moving the columns, we want to move all the columns in this group in one go, and in the order they
    // are currently in the screen.
    public getAllColumnsInThisGroup(): Column[] {
        var allColumnsOriginalOrder = this.columnGroup.getOriginalColumnGroup().getLeafColumns();
        var allColumnsCurrentOrder: Column[] = [];
        this.columnController.getAllDisplayedColumns().forEach( column => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                _.removeFromArray(allColumnsOriginalOrder, column);
            }
        });
        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach( column => allColumnsCurrentOrder.push(column));

        return allColumnsCurrentOrder;
    }

    private isSuppressMoving(): boolean {
        // if any child is fixed, then don't allow moving
        var childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach( (column: Column) => {
            if (column.getColDef().suppressMovable) {
                childSuppressesMoving = true;
            }
        });

        var result = childSuppressesMoving
            || this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.gridOptionsWrapper.isForPrint();

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

        if (!this.gridOptionsWrapper.isEnableColResize()) {
            _.removeFromParent(this.eHeaderCellResize);
            return;
        }

        this.dragService.addDragHandling({
            eDraggableElement: this.eHeaderCellResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });

        if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
            this.eHeaderCellResize.addEventListener('dblclick', (event:MouseEvent) => {
                // get list of all the column keys we are responsible for
                var keys: string[] = [];
                this.columnGroup.getDisplayedLeafColumns().forEach( (column: Column)=>{
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length>0) {
                    this.columnController.autoSizeColumns(keys);
                }
            });
        }
    }

    public onDragStart(): void {
        this.groupWidthStart = this.columnGroup.getActualWidth();
        this.childrenWidthStarts = [];
        this.columnGroup.getDisplayedLeafColumns().forEach( (column: Column) => {
            this.childrenWidthStarts.push(column.getActualWidth());
        });
    }

    public onDragging(dragChange: any, finished: boolean): void {

        let dragChangeNormalised = this.normaliseDragChange(dragChange);
        let newWidth = this.groupWidthStart + dragChangeNormalised;

        var minWidth = this.columnGroup.getMinWidth();
        if (newWidth < minWidth) {
            newWidth = minWidth;
        }

        // distribute the new width to the child headers
        var changeRatio = newWidth / this.groupWidthStart;
        // keep track of pixels used, and last column gets the remaining,
        // to cater for rounding errors, and min width adjustments
        var pixelsToDistribute = newWidth;
        var displayedColumns = this.columnGroup.getDisplayedLeafColumns();
        displayedColumns.forEach( (column: Column, index: any) => {
            var notLastCol = index !== (displayedColumns.length - 1);
            var newChildSize: any;
            if (notLastCol) {
                // if not the last col, calculate the column width as normal
                var startChildSize = this.childrenWidthStarts[index];
                newChildSize = startChildSize * changeRatio;
                if (newChildSize < column.getMinWidth()) {
                    newChildSize = column.getMinWidth();
                }
                pixelsToDistribute -= newChildSize;
            } else {
                // if last col, give it the remaining pixels
                newChildSize = pixelsToDistribute;
            }
            this.columnController.setColumnWidth(column, newChildSize, finished);
        });
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
