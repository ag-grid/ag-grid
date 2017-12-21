import {Component} from "../widgets/component";
import {Autowired, PostConstruct} from "../context/context";
import {RowNode} from "../entities/rowNode";
import {DragAndDropService, DragItem, DragSource, DragSourceType} from "../dragAndDrop/dragAndDropService";

export class RowDraggingComp extends Component {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private rowNode: RowNode;
    private cellValue: string;

    constructor(rowNode: RowNode, cellValue: string) {
        super(`<span class="ag-row-drag"></span>`);
        this.rowNode = rowNode;
        this.cellValue = cellValue;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDragSource();
    }

    private addDragSource(): void {

        let dragItem: DragItem = {
            rowNode: this.rowNode
        };

        let dragSource: DragSource = {
            type: DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: this.cellValue,
            dragItemCallback: () => dragItem
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
    }
}
