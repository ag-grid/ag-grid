import {
    Autowired,
    CellComp,
    CellNavigationService,
    CellPosition,
    CellRange,
    ColumnController,
    Component,
    DragService,
    IFillHandle,
    MouseEventService,
    PostConstruct,
    RowPosition,
    RowPositionUtils,
    RowRenderer,
    _,
} from 'ag-grid-community';
import { RangeController } from '../../rangeController';

export class FillHandle extends Component implements IFillHandle {

    @Autowired("rowRenderer") private rowRenderer: RowRenderer;
    @Autowired("dragService") private dragService: DragService;
    @Autowired("rangeController") private rangeController: RangeController;
    @Autowired("mouseEventService") private mouseEventService: MouseEventService;
    @Autowired("columnController") private columnController: ColumnController;
    @Autowired("cellNavigationService") private cellNavigationService: CellNavigationService;

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
            this.markPathFrom(this.cellComp.getCellPosition(), this.lastCellHovered);
        }
    }

    private onDragEnd(e: MouseEvent) {
        if (this.markedCellComps.length) {
            const isX = this.dragAxis === 'x';
            if (!this.isUp && !this.isLeft) {
                const startPosition = {
                    rowIndex: this.rangeStartRow.rowIndex,
                    rowPinned: this.rangeStartRow.rowPinned,
                    column: this.cellRange.columns[0]
                }
                this.rangeController.setRangeToCell(startPosition);
                this.rangeController.extendLatestRangeToCell({
                    rowIndex: isX ? this.rangeEndRow.rowIndex : this.lastCellMarked!.rowIndex,
                    rowPinned: isX ? this.rangeEndRow.rowPinned : this.lastCellMarked!.rowPinned,
                    column: isX ? this.lastCellMarked!.column : this.cellRange.columns[this.cellRange.columns.length - 1]
                });
            }
            else {
                const startRow = isX ? this.rangeStartRow: this.lastCellMarked!;
                const startPosition = {
                    rowIndex: startRow.rowIndex,
                    rowPinned: startRow.rowPinned,
                    column: isX ? this.lastCellMarked!.column : this.cellRange.columns[0]
                }
                this.rangeController.setRangeToCell(startPosition);

                this.rangeController.extendLatestRangeToCell({
                    rowIndex: this.rangeEndRow.rowIndex,
                    rowPinned: this.rangeEndRow.rowPinned,
                    column: this.cellRange.columns[this.cellRange.columns.length - 1]
                });
            }
        }
        this.clearMarkedPath();
        this.lastCellHovered = undefined;
        this.lastCellMarked = undefined;

        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    }

    private markPathFrom(initialPosition: CellPosition, currentPosition: CellPosition) {
        this.clearMarkedPath();
        if (this.dragAxis === 'y') {
            if (RowPositionUtils.sameRow(currentPosition, initialPosition)) { return; }

            const isBefore = RowPositionUtils.before(currentPosition, initialPosition);

            if (isBefore && (
                    (
                        currentPosition.rowPinned == this.rangeStartRow.rowPinned &&
                        currentPosition.rowIndex >= this.rangeStartRow.rowIndex
                    ) ||
                    (
                        this.rangeStartRow.rowPinned != this.rangeEndRow.rowPinned &&
                        currentPosition.rowPinned == this.rangeEndRow.rowPinned &&
                        currentPosition.rowIndex <= this.rangeEndRow.rowIndex
                    )
                )
            ) { 
                this.reduceVertical(initialPosition, currentPosition);
            }
            else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
            }
        }
        else {
            const initialColumn = initialPosition.column;
            const currentColumn = currentPosition.column;

            if (initialColumn === currentColumn) { return; }

            const displayedColumns = this.columnController.getAllDisplayedColumns();
            const initialIndex = displayedColumns.indexOf(initialColumn)
            const currentIndex = displayedColumns.indexOf(currentColumn);

            if (currentIndex <= initialIndex && currentIndex >= displayedColumns.indexOf(this.cellRange.columns[0])) {
                this.reduceHorizontal(initialPosition, currentPosition)
            } 
            else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
            }
        }
    }

    private extendVertical(initialPosition: CellPosition, endPosition: CellPosition, isMovingUp?: boolean) {
        let row: RowPosition | null = initialPosition;

        while(
            row = isMovingUp ? 
                this.cellNavigationService.getRowAbove(row.rowIndex, row.rowPinned as string) : 
                this.cellNavigationService.getRowBelow(row)
        ) {
            const colLen = this.cellRange.columns.length;
            for (let i = 0; i < colLen; i++) {
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: this.cellRange.columns[i]
                });

                if (!cellComp) { continue; }
                this.markedCellComps.push(cellComp);

                const eGui = cellComp.getGui();
        
                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', i === 0);
                _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', i === colLen - 1);

                _.addOrRemoveCssClass(
                    eGui, 
                    isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom',
                    RowPositionUtils.sameRow(row, endPosition)
                );

                if (isMovingUp) { this.isUp = true; }
            }

            if (RowPositionUtils.sameRow(row, endPosition)) { break; }
        }
    }

    private reduceVertical(initialPosition: CellPosition, endPosition: CellPosition) {
        let row: RowPosition | null = initialPosition;

        while(row = this.cellNavigationService.getRowAbove(row.rowIndex, row.rowPinned as string)) {
            const colLen = this.cellRange.columns.length;
            for (let i = 0; i < colLen; i++) {
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: this.cellRange.columns[i]
                });

                if (!cellComp) { continue; }

                this.markedCellComps.push(cellComp);

                const eGui = cellComp.getGui();
        
                _.addOrRemoveCssClass(
                    eGui, 
                    'ag-selection-fill-bottom',
                    RowPositionUtils.sameRow(row, endPosition)
                );
            }

            if (RowPositionUtils.sameRow(row, endPosition)) { break; }
        }
    }

    private extendHorizontal(initialPosition: CellPosition, endPosition: CellPosition, isMovingLeft?: boolean) {
        const allCols = this.columnController.getAllDisplayedColumns();
        const startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
        const endCol = allCols.indexOf(isMovingLeft ? this.cellRange.columns[0] : endPosition.column);
        const offset = isMovingLeft ? 0 : 1;

        const colsToMark = allCols.slice(startCol + offset, endCol + offset);
        colsToMark.forEach(column => {
            let row: RowPosition = this.rangeStartRow;
            let isLastRow: boolean = false;

            do {
                isLastRow = RowPositionUtils.sameRow(row, this.rangeEndRow);
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });

                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    const eGui = cellComp.getGui();

                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-top', RowPositionUtils.sameRow(row, this.rangeStartRow));
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-bottom', RowPositionUtils.sameRow(row, this.rangeEndRow));
                    if (isMovingLeft) {
                        this.isLeft = true;
                        _.addOrRemoveCssClass(eGui, 'ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === colsToMark[colsToMark.length - 1]);
                    }
                }

                row = this.cellNavigationService.getRowBelow(row) as RowPosition;
            }
            while(!isLastRow)
        });
    }

    private reduceHorizontal(initialPosition: CellPosition, endPosition: CellPosition) {
        const allCols = this.columnController.getAllDisplayedColumns();
        const startCol = allCols.indexOf(endPosition.column);
        const endCol = allCols.indexOf(initialPosition.column);

        const colsToMark = allCols.slice(startCol, endCol);
        colsToMark.forEach(column => {
            let row: RowPosition = this.rangeStartRow;
            let isLastRow: boolean = false;

            do {
                isLastRow = RowPositionUtils.sameRow(row, this.rangeEndRow);
                const cellComp = this.rowRenderer.getComponentForCell({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });

                if (cellComp) {
                    this.markedCellComps.push(cellComp);
                    const eGui = cellComp.getGui();
                    _.addOrRemoveCssClass(eGui, 'ag-selection-fill-right', column === colsToMark[0]);
                }

                row = this.cellNavigationService.getRowBelow(row) as RowPosition;
            }
            while(!isLastRow)
        });
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

    public refresh(cellComp: CellComp) {
        const oldCellComp = this.cellComp;
        const eGui = this.getGui();

        const cellRange = this.rangeController.getCellRanges()[0];

        const isColumnRange = !cellRange.startRow || !cellRange.endRow;

        if (isColumnRange && eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }

        let start = this.rangeStartRow = cellRange.startRow as RowPosition;
        let end = this.rangeEndRow = cellRange.endRow as RowPosition;

        const isBefore = RowPositionUtils.before(end, start);

        if (isBefore) {
            this.rangeStartRow = end;
            this.rangeEndRow = start;
        }

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