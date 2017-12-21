import {Component} from "../widgets/component";
import {Autowired, PostConstruct} from "../context/context";
import {RowNode} from "../entities/rowNode";
import {DragAndDropService, DragItem, DragSource, DragSourceType} from "../dragAndDrop/dragAndDropService";
import {EventService} from "../eventService";
import {SortService} from "../rowNodes/sortService";
import {FilterManager} from "../filter/filterManager";
import {Events} from "../eventKeys";
import {SortController} from "../sortController";
import {_} from "../utils";
import {ColumnController} from "../columnController/columnController";

export class RowDraggingComp extends Component {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnController') private columnController: ColumnController;

    private rowNode: RowNode;
    private cellValue: string;

    private sortActive: boolean;
    private filterActive: boolean;
    private rowGroupActive: boolean;

    constructor(rowNode: RowNode, cellValue: string) {
        super(`<span class="ag-row-drag"></span>`);
        this.rowNode = rowNode;
        this.cellValue = cellValue;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDragSource();

        // we do not show the component if sort, filter or grouping is active

        this.addDestroyableEventListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));

        this.updateSortActive();
        this.updateFilterActive();
        this.updateRowGroupActive();

        this.workOutVisibility();
    }

    private updateRowGroupActive(): void {
        let rowGroups = this.columnController.getRowGroupColumns();
        this.rowGroupActive = _.missingOrEmpty(rowGroups);
    }

    private onRowGroupChanged(): void {
        this.updateRowGroupActive();
        this.workOutVisibility();
    }

    private updateSortActive(): void {
        let sortModel = this.sortController.getSortModel();
        this.sortActive = !_.missingOrEmpty(sortModel);
    }

    private onSortChanged(): void {
        this.updateSortActive();
        this.workOutVisibility();
    }

    private updateFilterActive(): void {
        this.filterActive = this.filterManager.isAnyFilterPresent();
    }

    private onFilterChanged(): void {
        this.updateFilterActive();
        this.workOutVisibility();
    }

    private workOutVisibility(): void {
        // only show the drag if both sort and filter are not present
        let visible = !this.sortActive && !this.filterActive;
        this.setVisible(visible);
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
