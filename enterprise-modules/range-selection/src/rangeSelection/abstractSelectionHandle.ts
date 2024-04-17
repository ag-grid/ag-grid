import {
    Autowired,
    CellCtrl,
    RowRenderer,
    DragService,
    Component,
    MouseEventService,
    ColumnModel,
    CellNavigationService,
    CellRange,
    RowPosition,
    CellPosition,
    PostConstruct,
    ISelectionHandle,
    RowPositionUtils,
    _,
    SelectionHandleType,
    NavigationService,
    CtrlsService,
    CellPositionUtils
} from "@ag-grid-community/core";
import { RangeService } from "./rangeService";

export abstract class AbstractSelectionHandle extends Component implements ISelectionHandle {

    @Autowired("rowRenderer") protected rowRenderer: RowRenderer;
    @Autowired("dragService") protected dragService: DragService;
    @Autowired("rangeService") protected rangeService: RangeService;
    @Autowired("mouseEventService") protected mouseEventService: MouseEventService;
    @Autowired("columnModel") protected columnModel: ColumnModel;
    @Autowired("cellNavigationService") protected cellNavigationService: CellNavigationService;
    @Autowired("navigationService") protected navigationService: NavigationService;
    @Autowired('rowPositionUtils') protected rowPositionUtils: RowPositionUtils;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;
    @Autowired('ctrlsService') protected ctrlsService: CtrlsService;

    private cellCtrl: CellCtrl;
    private cellRange: CellRange;

    private rangeStartRow: RowPosition;
    private rangeEndRow: RowPosition;

    private cellHoverListener: (() => void) | undefined;
    private lastCellHovered: CellPosition | null | undefined;
    protected changedCalculatedValues: boolean = false;
    private dragging: boolean = false;

    protected abstract type: SelectionHandleType;
    protected shouldDestroyOnEndDragging: boolean = false;

    @PostConstruct
    private init() {
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: (e: MouseEvent | Touch) => {
                this.dragging = true;
                this.rangeService.autoScrollService.check(e as MouseEvent);

                if (this.changedCalculatedValues) {
                    this.onDrag(e);
                    this.changedCalculatedValues = false;
                }
            },
            onDragStop: (e: MouseEvent | Touch) => {
                this.dragging = false;
                this.onDragEnd(e);
                this.clearValues();
                this.rangeService.autoScrollService.ensureCleared();

                // TODO: this causes a bug where if there are multiple grids in the same page, all of them will
                // be affected by a drag on any. Move it to the root element.
                document.body.classList.remove(this.getDraggingCssClass());

                if (this.shouldDestroyOnEndDragging) {
                    this.destroy();
                }
            }
        });

        this.addManagedListener(
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

    protected getCellCtrl(): CellCtrl | undefined {
        return this.cellCtrl;
    }

    protected setCellCtrl(cellComp: CellCtrl) {
        this.cellCtrl = cellComp;
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

    protected getLastCellHovered(): CellPosition | null | undefined {
        return this.lastCellHovered;
    }

    private preventRangeExtension(e: MouseEvent) {
        e.stopPropagation();
    }

    protected onDragStart(e: MouseEvent) {
        this.cellHoverListener = this.addManagedListener(
            this.ctrlsService.get('gridCtrl').getGui(),
            'mousemove',
            this.updateValuesOnMove.bind(this)
        );

        document.body.classList.add(this.getDraggingCssClass());
    }

    private getDraggingCssClass(): string {
        return `ag-dragging-${this.type === SelectionHandleType.FILL ? 'fill' : 'range'}-handle`;
    }

    protected updateValuesOnMove(e: MouseEvent) {
        const cell = this.mouseEventService.getCellPositionForEvent(e);

        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) { return; }

        this.lastCellHovered = cell;
        this.changedCalculatedValues = true;
    }

    public getType(): SelectionHandleType {
        return this.type;
    }

    public refresh(cellCtrl: CellCtrl) {
        const oldCellComp = this.getCellCtrl();
        const eGui = this.getGui();

        const cellRange = _.last(this.rangeService.getCellRanges());

        const start = cellRange.startRow;
        const end = cellRange.endRow;

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

        if (oldCellComp !== cellCtrl || !_.isVisible(eGui)) {
            this.setCellCtrl(cellCtrl);
            const eParentOfValue = cellCtrl.getComp().getParentOfValue();
            if (eParentOfValue) {
                eParentOfValue.appendChild(eGui);
            }
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

    protected destroy() {
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
