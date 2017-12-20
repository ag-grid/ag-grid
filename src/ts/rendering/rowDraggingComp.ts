import {Component} from "../widgets/component";
import {Autowired, PostConstruct} from "../context/context";
import {RowNode} from "../entities/rowNode";
import {DragAndDropService, DragItem, DragSource, DragSourceType} from "../dragAndDrop/dragAndDropService";

export class RowDraggingComp extends Component {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private rowNode: RowNode;
    private cellValue: string;

    private static BACKGROUND_IMAGE = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38gYGAEESAAEGAAasgJOgzOKCoAAAAASUVORK5CYII=)`;

    constructor(rowNode: RowNode, cellValue: string) {
        // super(`<span style="display: inline-block; border: 1px solid grey; width: 15px; height: 15px; margin-right: 10px; background-color: #00ACC1;"></span>`);
        super(`<span style="display: inline-block; background-image: ${RowDraggingComp.BACKGROUND_IMAGE}; width: 8px; height: 16px; position: relative; top: 4px; margin-right: 10px;  "></span>`);
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
