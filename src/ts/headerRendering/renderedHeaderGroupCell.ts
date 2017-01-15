import {Utils as _} from "../utils";
import {SvgFactory} from "../svgFactory";
import {ColumnGroup} from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";
import {FilterManager} from "../filter/filterManager";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Column} from "../entities/column";
import {HorizontalDragService} from "./horizontalDragService";
import {Autowired, PostConstruct} from "../context/context";
import {CssClassApplier} from "./cssClassApplier";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";
import {DragSource, DropTarget, DragAndDropService, DragSourceType} from "../dragAndDrop/dragAndDropService";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";
import {TouchListener} from "../widgets/touchListener";
import {Component} from "../widgets/component";

var svgFactory = SvgFactory.getInstance();

export class RenderedHeaderGroupCell extends Component {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('horizontalDragService') private dragService: HorizontalDragService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private eHeaderCellResize: HTMLElement;
    private columnGroup: ColumnGroup;
    private dragSourceDropTarget: DropTarget;

    private groupWidthStart: number;
    private childrenWidthStarts: number[];

    private eRoot: HTMLElement;

    private displayName: string;
    private pinned: string;

    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string) {
        super(`<div/>`);
        this.columnGroup = columnGroup;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    @PostConstruct
    public init(): void {

        CssClassApplier.addHeaderClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);

        // this.displayName = this.columnGroup.getHeaderName();
        this.displayName = this.columnController.getDisplayNameForColumnGroup(this.columnGroup, 'header');

        this.setupResize();
        this.addClasses();
        this.setupLabel();
        this.setupMove();
        this.setWidth();

        var setLeftFeature = new SetLeftFeature(this.columnGroup, this.getGui());
        this.addDestroyFunc( () => setLeftFeature.destroy() );
    }

    private setupLabel(): void {
        // no renderer, default text render
        if (this.displayName && this.displayName !== '') {
            var eGroupCellLabel = document.createElement("div");
            eGroupCellLabel.className = 'ag-header-group-cell-label';
            this.getGui().appendChild(eGroupCellLabel);

            if (_.isBrowserSafari()) {
                eGroupCellLabel.style.display = 'table-cell';
            }

            var eInnerText = document.createElement("span");
            eInnerText.className = 'ag-header-group-text';
            eInnerText.innerHTML = this.displayName;
            eGroupCellLabel.appendChild(eInnerText);

            if (this.columnGroup.isExpandable()) {
                this.addGroupExpandIcon(eGroupCellLabel);
            }
        }
    }

    private addClasses(): void {
        _.addCssClass(this.getGui(), 'ag-header-group-cell');
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        // columnGroup.getColGroupDef
        if (this.columnGroup.isPadding()) {
            _.addCssClass(this.getGui(), 'ag-header-group-cell-no-group');
        } else {
            _.addCssClass(this.getGui(), 'ag-header-group-cell-with-group');
        }
    }

    private setupResize(): void {
        if (!this.gridOptionsWrapper.isEnableColResize()) { return; }

        this.eHeaderCellResize = document.createElement("div");
        this.eHeaderCellResize.className = "ag-header-cell-resize";
        this.getGui().appendChild(this.eHeaderCellResize);
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

    private setupMove(): void {
        var eLabel = this.queryForHtmlElement('.ag-header-group-cell-label');
        if (!eLabel) { return; }

        if (this.isSuppressMoving()) { return; }
    
        if (eLabel) {
            var dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eLabel,
                dragItemName: this.displayName,
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

    private setWidth(): void {

        this.columnGroup.getLeafColumns().forEach( column =>
            this.addDestroyableEventListener(column, Column.EVENT_WIDTH_CHANGED, this.onWidthChanged.bind(this))
        );

        this.onWidthChanged();
    }

    private onWidthChanged(): void {
        this.getGui().style.width = this.columnGroup.getActualWidth() + 'px';
    }

    private addGroupExpandIcon(eGroupCellLabel: HTMLElement) {
        let eGroupIcon: any;
        if (this.columnGroup.isExpanded()) {
            eGroupIcon = _.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createGroupContractedIcon);
            _.addCssClass(eGroupIcon, 'ag-header-expand-icon-expanded');
        } else {
            eGroupIcon = _.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedIcon);
            _.addCssClass(eGroupIcon, 'ag-header-expand-icon-collapsed');
        }
        _.addCssClass(eGroupIcon, 'ag-header-expand-icon');
        eGroupCellLabel.appendChild(eGroupIcon);

        var expandAction = ()=> {
            var newExpandedValue = !this.columnGroup.isExpanded();
            this.columnController.setColumnGroupOpened(this.columnGroup, newExpandedValue);
        };

        this.addDestroyableEventListener(eGroupIcon, 'click', expandAction);

        let touchListener = new TouchListener(eGroupIcon);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, expandAction);
        this.addDestroyFunc( ()=> touchListener.destroy() );
    }

    public onDragStart(): void {
        this.groupWidthStart = this.columnGroup.getActualWidth();
        this.childrenWidthStarts = [];
        this.columnGroup.getDisplayedLeafColumns().forEach( (column: Column) => {
            this.childrenWidthStarts.push(column.getActualWidth());
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

}
