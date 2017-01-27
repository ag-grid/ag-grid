
import {Component} from "../widgets/component";
import {PostConstruct, Autowired, Context} from "../context/context";
import {Column} from "../entities/column";
import {Utils as _} from "../utils";
import {DropTarget, DragAndDropService, DragSource, DragSourceType} from "../dragAndDrop/dragAndDropService";
import {HeaderComp, IHeaderCompParams} from "./headerComp";
import {FilterManager} from "../filter/filterManager";
import {ColumnController} from "../columnController/columnController";
import {GridCore} from "../gridCore";
import {HeaderTemplateLoader} from "./headerTemplateLoader";
import {HorizontalDragService} from "./horizontalDragService";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SortController} from "../sortController";
import {CssClassApplier} from "./cssClassApplier";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";
import {TouchListener} from "../widgets/touchListener";
import {IComponent} from "../interfaces/iComponent";

export class HeaderWrapperComp extends Component {

    private static TEMPLATE =
        '<div class="ag-header-cell">' +
          '<div ref="agResizeBar" class="ag-header-cell-resize"></div>' +
            // <inner component goes here>
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('horizontalDragService') private horizontalDragService: HorizontalDragService;

    private column: Column;
    private eRoot: HTMLElement;
    private dragSourceDropTarget: DropTarget;
    private pinned: string;

    private startWidth: number;

    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string) {
        super(HeaderWrapperComp.TEMPLATE);
        this.column = column;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    @PostConstruct
    private init(): void {
        let displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);

        let headerComp = this.appendHeaderComp(displayName);

        this.setupWidth();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMove(headerComp.getGui(), displayName);

        var setLeftFeature = new SetLeftFeature(this.column, this.getGui());
        this.addDestroyFunc( ()=> setLeftFeature.destroy() );

        this.addAttributes();
        CssClassApplier.addHeaderClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);

    }

    private appendHeaderComp(displayName: string): IComponent<any> {
        let headerComp = new HeaderComp();

        let params = <IHeaderCompParams> {
            column: this.column,
            displayName: displayName
        };

        headerComp.init(params);

        this.appendChild(headerComp);

        return headerComp;
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
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.column.getColDef().suppressMovable
            || this.gridOptionsWrapper.isForPrint();

        if (suppressMove) { return; }

        if (eHeaderCellLabel) {
            var dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                dragItem: [this.column],
                dragItemName: displayName,
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
        }
    }

    private setupResize(): void {
        var colDef = this.column.getColDef();
        var eResize = this.queryForHtmlElement('[ref="agResizeBar"]');

        // if no eResize in template, do nothing
        if (!eResize) {
            return;
        }

        var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
        if (!weWantResize) {
            _.removeFromParent(eResize);
            return;
        }

        this.horizontalDragService.addDragHandling({
            eDraggableElement: eResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });

        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            this.addDestroyableEventListener(eResize, 'dblclick', () => {
                this.columnController.autoSizeColumn(this.column);
            });
        }
    }

    public onDragging(dragChange: number, finished: boolean): void {
        let dragChangeNormalised = this.normaliseDragChange(dragChange);
        let newWidth = this.startWidth + dragChangeNormalised;
        this.columnController.setColumnWidth(this.column, newWidth, finished);
    }

    public onDragStart(): void {
        this.startWidth = this.column.getActualWidth();
    }

    private setupTooltip(): void {
        var colDef = this.column.getColDef();

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
        this.getGui().setAttribute("colId", this.column.getColId());
    }

    private setupWidth(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
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
