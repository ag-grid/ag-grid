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
import {Beans} from "./beans";
import {BeanStub} from "../context/beanStub";

export class RowDraggingComp extends Component {

    private beans: Beans;

    private rowNode: RowNode;
    private cellValue: string;

    constructor(rowNode: RowNode, cellValue: string, beans: Beans) {
        super(`<span class="ag-row-drag"></span>`);
        this.rowNode = rowNode;
        this.cellValue = cellValue;
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDragSource();

        if (this.beans.gridOptionsWrapper.isRowDragFiresEvents()) {

        } else {
            this.addFeature(this.beans.context, new DefaultVisibilityStrategy(this, this.beans) );
        }
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
        this.beans.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc( ()=> this.beans.dragAndDropService.removeDragSource(dragSource) );
    }
}

class DefaultVisibilityStrategy extends BeanStub {

    private parent: RowDraggingComp;
    private beans: Beans;

    private sortActive: boolean;
    private filterActive: boolean;
    private rowGroupActive: boolean;

    constructor(parent: RowDraggingComp, beans: Beans) {
        super();
        this.parent = parent;
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        // we do not show the component if sort, filter or grouping is active

        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));

        this.updateSortActive();
        this.updateFilterActive();
        this.updateRowGroupActive();

        this.workOutVisibility();
    }

    private updateRowGroupActive(): void {
        let rowGroups = this.beans.columnController.getRowGroupColumns();
        this.rowGroupActive = _.missingOrEmpty(rowGroups);
    }

    private onRowGroupChanged(): void {
        this.updateRowGroupActive();
        this.workOutVisibility();
    }

    private updateSortActive(): void {
        let sortModel = this.beans.sortController.getSortModel();
        this.sortActive = !_.missingOrEmpty(sortModel);
    }

    private onSortChanged(): void {
        this.updateSortActive();
        this.workOutVisibility();
    }

    private updateFilterActive(): void {
        this.filterActive = this.beans.filterManager.isAnyFilterPresent();
    }

    private onFilterChanged(): void {
        this.updateFilterActive();
        this.workOutVisibility();
    }

    private workOutVisibility(): void {
        // only show the drag if both sort and filter are not present
        let visible = !this.sortActive && !this.filterActive;
        this.parent.setVisible(visible);
    }
}
