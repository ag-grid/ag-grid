import { Component } from "../widgets/component";
import { PostConstruct } from "../context/context";
import { RowNode } from "../entities/rowNode";
import { DragItem, DragSource, DragSourceType } from "../dragAndDrop/dragAndDropService";
import { Events } from "../eventKeys";
import { Beans } from "./beans";
import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { _ } from "../utils";

export class RowDragComp extends Component {

    private readonly beans: Beans;

    private readonly rowNode: RowNode;
    private readonly column: Column;
    private readonly cellValue: string;
    private visibleMode: 'display' | 'visibility' | null = null;

    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans) {
        super(`<div class="ag-row-drag"></div>`);
        this.rowNode = rowNode;
        this.column = column;
        this.cellValue = cellValue;
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        const eGui = this.getGui();
        eGui.appendChild(_.createIconNoSpan('rowDrag', this.beans.gridOptionsWrapper, null));
        this.addDragSource();

        this.checkCompatibility();

        if (this.beans.gridOptionsWrapper.isRowDragManaged()) {
            this.addFeature(this.beans.context,
                new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column));
        } else {
            this.addFeature(this.beans.context,
                new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column));
        }
    }

    // returns true if all compatibility items work out
    private checkCompatibility(): void {
        const managed = this.beans.gridOptionsWrapper.isRowDragManaged();
        const treeData = this.beans.gridOptionsWrapper.isTreeData();

        if (treeData && managed) {
            _.doOnce(() =>
                console.warn('ag-Grid: If using row drag with tree data, you cannot have rowDragManaged=true'),
                'RowDragComp.managedAndTreeData'
            );
        }
    }

    private addDragSource(): void {

        const dragItem: DragItem = {
            rowNode: this.rowNode
        };

        const dragSource: DragSource = {
            type: DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: this.cellValue,
            dragItemCallback: () => dragItem,
            dragStartPixels: 0
        };
        this.beans.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.beans.dragAndDropService.removeDragSource(dragSource));
    }

    public getVisibleMode() {
        return this.visibleMode;
    }

    public setVisibleMode(type: 'display' | 'visibility') {
        this.visibleMode = type;
    }
}

// when non managed, the visibility depends on suppressRowDrag property only
class NonManagedVisibilityStrategy extends BeanStub {

    private readonly parent: RowDragComp;
    private readonly beans: Beans;
    private readonly column: Column;
    private readonly rowNode: RowNode;

    constructor(parent: RowDragComp, beans: Beans, rowNode: RowNode, column: Column) {
        super();
        this.parent = parent;
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));

        // in case data changes, then we need to update visibility of drag item
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));

        this.workOutVisibility();
    }

    private onSuppressRowDrag(): void {
        this.workOutVisibility();
    }

    private workOutVisibility(): void {

        // only show the drag if both sort and filter are not present
        const suppressRowDrag = this.beans.gridOptionsWrapper.isSuppressRowDrag();

        if (suppressRowDrag) {
            this.parent.setVisibleMode('display');
            this.parent.setVisible(false, 'display');
        } else {
            const visible = this.column.isRowDrag(this.rowNode);
            if (!this.parent.getVisibleMode()) {
                const isRowDragFunc = _.isFunction(this.column.getColDef().rowDrag);
                this.parent.setVisibleMode(isRowDragFunc ? 'visibility' : 'display');
            }
            this.parent.setVisible(visible, this.parent.getVisibleMode());
        }
    }

}

// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
class ManagedVisibilityStrategy extends BeanStub {

    private readonly parent: RowDragComp;
    private readonly column: Column;
    private readonly rowNode: RowNode;
    private readonly beans: Beans;

    private sortActive: boolean;
    private filterActive: boolean;
    private rowGroupActive: boolean;

    constructor(parent: RowDragComp, beans: Beans, rowNode: RowNode, column: Column) {
        super();
        this.parent = parent;
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
    }

    @PostConstruct
    private postConstruct(): void {
        // we do not show the component if sort, filter or grouping is active

        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));

        // in case data changes, then we need to update visibility of drag item
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));

        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));

        this.updateSortActive();
        this.updateFilterActive();
        this.updateRowGroupActive();

        this.workOutVisibility();
    }

    private updateRowGroupActive(): void {
        const rowGroups = this.beans.columnController.getRowGroupColumns();
        this.rowGroupActive = !_.missingOrEmpty(rowGroups);
    }

    private onRowGroupChanged(): void {
        this.updateRowGroupActive();
        this.workOutVisibility();
    }

    private updateSortActive(): void {
        const sortModel = this.beans.sortController.getSortModel();
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

    private onSuppressRowDrag(): void {
        this.workOutVisibility();
    }

    private workOutVisibility(): void {
        // only show the drag if both sort and filter are not present
        const sortOrFilterOrGroupActive = this.sortActive || this.filterActive || this.rowGroupActive;
        const suppressRowDrag = this.beans.gridOptionsWrapper.isSuppressRowDrag();

        const alwaysHide = sortOrFilterOrGroupActive || suppressRowDrag;

        if (alwaysHide) {
            this.parent.setVisibleMode('display');
            this.parent.setVisible(false, 'display');
        } else {
            const visible = this.column.isRowDrag(this.rowNode);
            if (!this.parent.getVisibleMode()) {
                const isRowDragFunc = _.isFunction(this.column.getColDef().rowDrag);
                this.parent.setVisibleMode(isRowDragFunc ? 'visibility' : 'display');
            }
            this.parent.setVisible(visible, this.parent.getVisibleMode());
        }
    }
}
