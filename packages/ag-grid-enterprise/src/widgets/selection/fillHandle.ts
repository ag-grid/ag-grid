import {
    AgEvent,
    Autowired,
    Component,
    CellComp,
    CellRange,
    RowRenderer,
    IFillHandle,
    RowPosition,
    DragService,
    PostConstruct,
    EventService,
    RowNode,
    _
} from 'ag-grid-community';
import { RangeController } from '../../rangeController';

export class FillHandle extends Component implements IFillHandle<any> {

    @Autowired("rowRenderer") private rowRenderer: RowRenderer;
    @Autowired("dragService") private dragService: DragService;
    @Autowired("rangeController") private rangeController: RangeController;
    @Autowired("eventService") private eventService: EventService;

    private cellComp: CellComp;
    private cellRange: CellRange;
    private rowHoverListener: (() => void) | undefined;

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
        this.rowHoverListener = this.addDestroyableEventListener(
            this.eventService, 
            RowNode.EVENT_MOUSE_ENTER, 
            this.updateLastHoveredRow.bind(this)
        );
    }

    private onDrag(e: MouseEvent) {

    }

    private onDragEnd(e: MouseEvent) {
        if (this.rowHoverListener) {
            console.log('removing listener');
            this.rowHoverListener();
        }
    }

    private updateLastHoveredRow(e: AgEvent) {
        console.log(e);
    }

    public refresh(cellRange: CellRange) {
        const oldCellComp = this.cellComp;
        const eGui = this.getGui();

        const { startRow, endRow, columns } = cellRange;
        const isColumnRange = !startRow || !endRow;

        if (isColumnRange && oldCellComp) {
            oldCellComp.getGui().removeChild(eGui);
        }

        let start = startRow as RowPosition;
        let end = endRow as RowPosition;

        if (start.rowIndex > end.rowIndex) {
            start = endRow as RowPosition;
            end = startRow as RowPosition;
        }
        
        const cellComp = this.rowRenderer.getComponentForCell({
            rowIndex: end.rowIndex,
            rowPinned: end.rowPinned,
            column: columns[columns.length - 1]
        });

        if (oldCellComp !== cellComp) {
            cellComp.appendChild(eGui);
        }


        if (!this.cellRange) {
            this.cellRange = cellRange;
        }
    }

    public destroy() {
        super.destroy();
        const eGui = this.getGui();

        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}