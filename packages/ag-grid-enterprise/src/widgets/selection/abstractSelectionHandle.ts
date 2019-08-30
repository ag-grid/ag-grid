import { 
    Autowired,
    CellComp,
    RowRenderer,
    DragService,
    Component,
    MouseEventService,
    ColumnController,
    CellNavigationService,
    CellRange,
    RowPosition,
    CellPosition,
    PostConstruct,
    ISelectionHandle,
    RowPositionUtils,
    _
} from "ag-grid-community";
import { RangeController } from "../../rangeController";

export abstract class AbstractSelectionHandle extends Component implements ISelectionHandle {

    @Autowired("rowRenderer") protected rowRenderer: RowRenderer;
    @Autowired("dragService") protected dragService: DragService;
    @Autowired("rangeController") protected rangeController: RangeController;
    @Autowired("mouseEventService") protected mouseEventService: MouseEventService;
    @Autowired("columnController") protected columnController: ColumnController;
    @Autowired("cellNavigationService") protected cellNavigationService: CellNavigationService;
    @Autowired('rowPositionUtils') protected rowPositionUtils: RowPositionUtils;

    private cellComp: CellComp;
    private cellRange: CellRange;

    private rangeStartRow: RowPosition;
    private rangeEndRow: RowPosition;

    private cellHoverListener: (() => void) | undefined;
    private lastCellHovered: CellPosition | undefined;
    private changedCell: boolean = false;
    private dragging: boolean = false;
    
    protected abstract type: string;
    protected shouldDestroyOnEndDragging: boolean = false;

    @PostConstruct
    private init() {
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: (e: MouseEvent | Touch) => {
                this.dragging = true;
                this.rangeController.autoScrollService.check(e as MouseEvent);

                if (this.changedCell) {
                    this.onDrag(e);
                }
            },
            onDragStop: (e: MouseEvent | Touch) => {
                this.dragging = false;
                this.onDragEnd(e);
                this.clearValues();
                this.rangeController.autoScrollService.ensureCleared();
                _.removeCssClass(document.body, `ag-dragging-${this.type}-handle`);
                if (this.shouldDestroyOnEndDragging) {
                    this.destroy();
                }
            }
        });

        this.addDestroyableEventListener(
            this.getGui(),
            'mousedown',
            this.preventRangeExtension.bind(this)
        );
    }

    protected abstract onDrag(e: MouseEvent | Touch): void;
    protected abstract onDragEnd(e: MouseEvent | Touch): void;

    protected isDragging(): boolean {
        return this.dragging;
    }

    protected getCellComp(): CellComp | undefined {
        return this.cellComp;
    }

    protected setCellComp(cellComp: CellComp) {
        this.cellComp = cellComp;
    }

    protected getCellRange(): CellRange {
        return this.cellRange;
    }

    protected setCellRange(range: CellRange) {
        this.cellRange = range;
    }

    protected getRangeStartRow(): RowPosition {
        return this.rangeStartRow;
    }

    protected setRangeStartRow(row: RowPosition) {
        this.rangeStartRow = row;
    }

    protected getRangeEndRow(): RowPosition {
        return this.rangeEndRow;
    }

    protected setRangeEndRow(row: RowPosition) {
        this.rangeEndRow = row;
    }

    protected getLastCellHovered(): CellPosition | undefined {
        return this.lastCellHovered;
    }

    private preventRangeExtension(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    protected onDragStart(e: MouseEvent) {
        this.cellHoverListener = this.addDestroyableEventListener(
            this.rowRenderer.getGridCore().getRootGui(), 
            'mousemove', 
            this.updateLastCellPositionHovered.bind(this)
        );

        _.addCssClass(document.body, `ag-dragging-${this.type}-handle`);
    }

    private updateLastCellPositionHovered(e: MouseEvent) {
        const cell = this.mouseEventService.getCellPositionForEvent(e);
        if (cell === this.lastCellHovered) {
            this.changedCell = false; 
            return; 
        }
        this.lastCellHovered = cell;
        this.changedCell = true;
    }

    public getType(): string {
        return this.type;
    }

    public refresh(cellComp: CellComp) {
        const oldCellComp = this.getCellComp();
        const eGui = this.getGui();

        const cellRange = _.last(this.rangeController.getCellRanges()) as CellRange;

        const start = cellRange.startRow as RowPosition;
        const end = cellRange.endRow as RowPosition;
        
        if (start && end) {
            const isBefore = this.rowPositionUtils.before(end, start);

            if (isBefore) {
                this.setRangeStartRow(end);
                this.setRangeEndRow(start);
            } else {
                this.setRangeStartRow(start);
                this.setRangeEndRow(end);
            }
        }

        if (oldCellComp !== cellComp) {
            this.setCellComp(cellComp);
            window.setTimeout(() => {
                if (this.isAlive()) {
                    cellComp.appendChild(eGui);
                }
            }, 1);
        }

        this.setCellRange(cellRange);
    }

    protected clearValues() {
        this.lastCellHovered = undefined;
        this.removeListeners();
    }

    private removeListeners() {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    }

    public destroy() {
        if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
            _.setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }

        this.shouldDestroyOnEndDragging = false;

        super.destroy();
        this.removeListeners();

        const eGui = this.getGui();

        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}
