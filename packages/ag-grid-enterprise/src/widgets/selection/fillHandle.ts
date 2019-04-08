import {
    Autowired,
    CellComp,
    CellPosition,
    CellRange,
    Column,
    Component,
    DragService,
    IFillHandle,
    GridOptionsWrapper,
    MouseEventService,
    PostConstruct,
    RowPosition,
    RowRenderer,
    _,
} from 'ag-grid-community';
import { RangeController } from '../../rangeController';

export class FillHandle extends Component implements IFillHandle<any> {

    @Autowired("rowRenderer") private rowRenderer: RowRenderer;
    @Autowired("dragService") private dragService: DragService;
    @Autowired("rangeController") private rangeController: RangeController;
    @Autowired("mouseEventService") private mouseEventService: MouseEventService;
    @Autowired("gridOptionsWrapper") gridOptionsWrapper: GridOptionsWrapper;

    private cellComp: CellComp;
    private cellRange: CellRange;

    private rangeStartRow: RowPosition;
    private rangeEndRow: RowPosition;

    private lastCellHovered: CellPosition | undefined;
    private lastCellMarked: CellPosition | undefined;
    private cellHoverListener: (() => void) | undefined;
    private markedCellComps: CellComp[] = [];
    private dragAxis: 'x' | 'y';
    private isUp: boolean = false;
    private isLeft: boolean = false;

    static TEMPLATE = '<div class="ag-fill-handle"></div>';

    constructor() {
        super(FillHandle.TEMPLATE);
    }

    @PostConstruct
    init() {
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

    private preventRangeExtension(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    private onDragStart(e: MouseEvent) {
        this.cellHoverListener = this.addDestroyableEventListener(
            this.rowRenderer.getGridCore().getRootGui(), 
            'mousemove', 
            this.updateLastCellPositionHovered.bind(this)
        );
    }

    private onDrag(e: MouseEvent) {
        const { x, y } = this.getGui().getBoundingClientRect() as DOMRect;
        const diffX = Math.abs(x - e.clientX);
        const diffY = Math.abs(y - e.clientY);
        const direction: 'x' | 'y' = diffX > diffY ? 'x' : 'y';

        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
        }

        if (this.lastCellHovered && this.lastCellHovered !== this.lastCellMarked) {
            this.lastCellMarked = this.lastCellHovered;
            this.markPathFrom(this.cellComp, this.lastCellHovered);
        }
    }

    private onDragEnd(e: MouseEvent) {
        if (this.markedCellComps.length) {
            const isX = this.dragAxis === 'x';
            if (!this.isUp && !this.isLeft) {
                this.rangeController.extendLatestRangeToCell({
                    rowIndex: isX ? this.rangeEndRow.rowIndex : this.lastCellMarked!.rowIndex,
                    rowPinned: undefined,
                    column: isX ? this.lastCellMarked!.column : this.cellRange.columns[this.cellRange.columns.length - 1]
                });
            }
            else {
                const startPosition = {
                    rowIndex: isX ? this.rangeStartRow.rowIndex : this.lastCellMarked!.rowIndex,
                    rowPinned: undefined,
                    column: isX ? this.lastCellMarked!.column : this.cellRange.columns[0]
                };
                this.rangeController.setRangeToCell(startPosition);

                this.rangeController.extendLatestRangeToCell({
                    rowIndex: this.rangeEndRow.rowIndex,
                    rowPinned: undefined,
                    column: this.cellRange.columns[this.cellRange.columns.length - 1]
                });
            }
            this.rangeController.refreshFillHandle();
        }
        this.clearMarkedPath();
        this.lastCellHovered = undefined;
        this.lastCellMarked = undefined;

        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    }

    private markPathFrom(initialComp: CellComp, currentPosition: CellPosition) {
        this.clearMarkedPath();
        if (this.dragAxis === 'y') {
            const rowIndex = initialComp.getRenderedRow().getRowNode().rowIndex;
            if (rowIndex < currentPosition.rowIndex) {
                this.extendVertical(rowIndex + 1, currentPosition.rowIndex);
            }
            else if (currentPosition.rowIndex < this.rangeStartRow.rowIndex) {
                this.extendVertical(currentPosition.rowIndex, this.rangeStartRow.rowIndex - 1, true);
            }
        }
        else {
            const displayedColumns = this.gridOptionsWrapper.getColumnApi()!.getDisplayedCenterColumns();
            const colIndex = displayedColumns.indexOf(initialComp.getColumn())
            const endIndex = displayedColumns.indexOf(currentPosition.column);
            let rangeStartColIdx;

            if (colIndex < endIndex) {
                this.extendHorizontal(colIndex + 1, endIndex, displayedColumns);
            }
            else if (endIndex < (rangeStartColIdx = displayedColumns.indexOf(this.cellRange.columns[0]))) {
                this.extendHorizontal(endIndex, rangeStartColIdx, displayedColumns, true);
            }
        }
    }

    private extendVertical(startIdx: number, endIdx: number, isMovingUp?: boolean) {
        for (let i = startIdx; i <= endIdx; i++) {
            const colLen = this.cellRange.columns.length;
            for (let j = 0; j < colLen; j++) {
                if (j !== 0 && j !== colLen - 1 && i !== (isMovingUp ? startIdx : endIdx)) { continue; }

                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: i,
                    rowPinned: undefined,
                    column: this.cellRange.columns[j]
                });
                if (!cellComp) { continue; }
                this.markedCellComps.push(cellComp);

                const eGui = cellComp.getGui();
        
                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', j === 0);
                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', j === colLen - 1);
                if (isMovingUp) {
                    this.isUp = true;
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', i === startIdx);
                }
                else {
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', i === endIdx);
                }
            }
        }
    }

    private extendHorizontal(startIdx: number, endIdx: number, columns: Column[], isMovingLeft?: boolean) {
        for (let i = startIdx; i <= endIdx; i++) { 
            for (let j = this.rangeStartRow.rowIndex; j <= this.rangeEndRow.rowIndex; j++) {
                if (j !== this.rangeStartRow.rowIndex && j !== this.rangeEndRow.rowIndex && i !== (isMovingLeft ? startIdx : endIdx)) { continue; }

                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: j,
                    rowPinned: undefined,
                    column: columns[i]
                });

                if (!cellComp) { continue; }
                this.markedCellComps.push(cellComp);

                const eGui = cellComp.getGui();

                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', j === this.rangeStartRow.rowIndex);
                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', j === this.rangeEndRow.rowIndex);
                if (isMovingLeft) {
                    this.isLeft = true;
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', i === startIdx);
                }
                else {
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', i === endIdx);
                }
            }
        }
    }

    private clearMarkedPath() {
        this.markedCellComps.forEach(cellComp => {
            const eGui = cellComp.getGui();
            _.removeCssClass(eGui, 'ag-selection-fill-top');
            _.removeCssClass(eGui, 'ag-selection-fill-right');
            _.removeCssClass(eGui, 'ag-selection-fill-bottom');
            _.removeCssClass(eGui, 'ag-selection-fill-left');
        });

        this.markedCellComps.length = 0;
        this.isUp = false;
        this.isLeft = false;
    }

    private updateLastCellPositionHovered(e: MouseEvent) {
        const cell = this.mouseEventService.getCellPositionForEvent(e);

        if (cell === this.lastCellHovered) { return; }

        this.lastCellHovered = cell;
        
    }

    public refresh(cellRange: CellRange) {
        const oldCellComp = this.cellComp;
        const eGui = this.getGui();

        const { startRow, endRow, columns } = cellRange;
        const isColumnRange = !startRow || !endRow;

        if (isColumnRange && oldCellComp) {
            oldCellComp.getGui().removeChild(eGui);
        }

        let start = this.rangeStartRow = startRow as RowPosition;
        let end = this.rangeEndRow = endRow as RowPosition;

        if (start.rowIndex > end.rowIndex) {
            start = this.rangeStartRow = endRow as RowPosition;
            end = this.rangeEndRow = startRow as RowPosition;
        }
        
        const cellComp = this.rowRenderer.getComponentForCell({
            rowIndex: end.rowIndex,
            rowPinned: end.rowPinned,
            column: columns[columns.length - 1]
        });

        if (oldCellComp !== cellComp) {
            this.cellComp = cellComp;
            cellComp.appendChild(eGui);
        }

        this.cellRange = cellRange;
    }

    public destroy() {
        super.destroy();
        const eGui = this.getGui();

        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}