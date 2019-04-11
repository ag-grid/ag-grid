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
    RowPositionUtils
} from "ag-grid-community";
import { RangeController } from "../../rangeController";

export abstract class AbstractSelectionHandle extends Component implements ISelectionHandle {
    @Autowired("rowRenderer") protected rowRenderer: RowRenderer;
    @Autowired("dragService") protected dragService: DragService;
    @Autowired("rangeController") protected rangeController: RangeController;
    @Autowired("mouseEventService") protected mouseEventService: MouseEventService;
    @Autowired("columnController") protected columnController: ColumnController;
    @Autowired("cellNavigationService") protected cellNavigationService: CellNavigationService;

    private cellComp: CellComp;
    private cellRange: CellRange;

    private rangeStartRow: RowPosition;
    private rangeEndRow: RowPosition;

    private lastCellHovered: CellPosition | undefined;
    
    private cellHoverListener: (() => void) | undefined;
    
    protected abstract type: string;

    @PostConstruct
    private init() {
        this.dragService.addDragSource({
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDrag.bind(this),
            onDragStop: this.onDragEnd.bind(this)
        });

        this.addDestroyableEventListener(
            this.getGui(),
            'mousedown',
            this.preventRangeExtension.bind(this)
        );
    }

    protected abstract onDrag(e: MouseEvent): void;
    protected abstract onDragEnd(e: MouseEvent): void;

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
    }

    private updateLastCellPositionHovered(e: MouseEvent) {
        const cell = this.mouseEventService.getCellPositionForEvent(e);
        if (cell === this.lastCellHovered) { return; }
        this.lastCellHovered = cell;
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

    public getType(): string {
        return this.type;
    }

    public refresh(cellComp: CellComp) {
        const oldCellComp = this.getCellComp();
        const eGui = this.getGui();

        const cellRange = this.rangeController.getCellRanges()[0];

        let start = cellRange.startRow as RowPosition;
        let end = cellRange.endRow as RowPosition;

        const isBefore = RowPositionUtils.before(end, start);

        if (isBefore) {
            this.setRangeStartRow(end);
            this.setRangeEndRow(start);
        } else {
            this.setRangeStartRow(start);
            this.setRangeEndRow(end);
        }

        if (oldCellComp !== cellComp) {
            this.setCellComp(cellComp);
            cellComp.appendChild(eGui);
        }

        this.setCellRange(cellRange);
    }

    public destroy() {
        super.destroy();
        this.removeListeners();

        const eGui = this.getGui();

        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}