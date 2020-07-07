import { Component } from "../widgets/component";
import { PostConstruct } from "../context/context";
import { RowNode } from "../entities/rowNode";
import { DragItem, DragSource, DragSourceType } from "../dragAndDrop/dragAndDropService";
import { Events } from "../eventKeys";
import { Beans } from "./beans";
import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { _ } from "../utils";

export interface IRowDragItem extends DragItem {
    defaultTextValue: string;
}

export class RowDragComp extends Component {
    private readonly beans: Beans;
    private readonly rowNode: RowNode;
    private readonly column: Column;
    private readonly cellValue: string;

    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans) {
        super(/* html */ `<div class="ag-drag-handle ag-row-drag" aria-hidden="true"></div>`);
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

        const strategy = this.beans.gridOptionsWrapper.isRowDragManaged() ?
            new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column) :
            new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column);

        this.createManagedBean(strategy, this.beans.context);
    }

    private getSelectedCount(): number {
        const multiRowEnabled = this.beans.gridOptionsWrapper.isEnableMultiRowDragging();
        if (!multiRowEnabled) { return 1; }

        const selection = this.beans.selectionController.getSelectedNodes();

        return selection.indexOf(this.rowNode) !== -1 ? selection.length : 1;
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
        const dragItem: IRowDragItem = {
            rowNode: this.rowNode,
            columns: [this.column],
            defaultTextValue: this.cellValue,
        };

        const rowDragText = this.column.getColDef().rowDragText;

        const dragSource: DragSource = {
            type: DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: () => {
                const dragItemCount = this.getSelectedCount();
                if (rowDragText) {
                    return rowDragText(dragItem, dragItemCount);
                }

                return dragItemCount === 1 ? this.cellValue : `${dragItemCount} rows`;
            },
            getDragItem: () => dragItem,
            dragStartPixels: 0
        };

        this.beans.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.beans.dragAndDropService.removeDragSource(dragSource));
    }
}

class VisibilityStrategy extends BeanStub {
    private readonly parent: RowDragComp;
    private readonly column: Column;
    protected readonly rowNode: RowNode;

    constructor(parent: RowDragComp, rowNode: RowNode, column: Column) {
        super();
        this.parent = parent;
        this.column = column;
        this.rowNode = rowNode;
    }

    protected setDisplayedOrVisible(neverDisplayed: boolean): void {
        if (neverDisplayed) {
            this.parent.setDisplayed(false);
        } else {
            const shown = this.column.isRowDrag(this.rowNode);
            const isShownSometimes = _.isFunction(this.column.getColDef().rowDrag);

            // if shown sometimes, them some rows can have drag handle while other don't,
            // so we use setVisible to keep the handles horizontally aligned (as setVisible
            // keeps the empty space, whereas setDisplayed looses the space)
            if (isShownSometimes) {
                this.parent.setDisplayed(true);
                this.parent.setVisible(shown);
            } else {
                this.parent.setDisplayed(shown);
            }
        }
    }
}

// when non managed, the visibility depends on suppressRowDrag property only
class NonManagedVisibilityStrategy extends VisibilityStrategy {
    private readonly beans: Beans;

    constructor(parent: RowDragComp, beans: Beans, rowNode: RowNode, column: Column) {
        super(parent, rowNode, column);
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));

        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));

        this.workOutVisibility();
    }

    private onSuppressRowDrag(): void {
        this.workOutVisibility();
    }

    private workOutVisibility(): void {
        // only show the drag if both sort and filter are not present
        const neverDisplayed = this.beans.gridOptionsWrapper.isSuppressRowDrag();
        this.setDisplayedOrVisible(neverDisplayed);
    }
}

// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
class ManagedVisibilityStrategy extends VisibilityStrategy {

    private readonly beans: Beans;

    constructor(parent: RowDragComp, beans: Beans, rowNode: RowNode, column: Column) {
        super(parent, rowNode, column);
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        // we do not show the component if sort, filter or grouping is active

        this.addManagedListener(this.beans.eventService, Events.EVENT_SORT_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_FILTER_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.workOutVisibility.bind(this));

        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));

        this.addManagedListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));

        this.workOutVisibility();
    }

    private onSuppressRowDrag(): void {
        this.workOutVisibility();
    }

    private workOutVisibility(): void {
        // only show the drag if both sort and filter are not present
        const rowDragFeature = this.beans.gridPanel.getRowDragFeature();
        const shouldPreventRowMove = rowDragFeature && rowDragFeature.shouldPreventRowMove();
        const suppressRowDrag = this.beans.gridOptionsWrapper.isSuppressRowDrag();
        const hasExternalDropZones = this.beans.dragAndDropService.hasExternalDropZones();
        const neverDisplayed = (shouldPreventRowMove && !hasExternalDropZones) || suppressRowDrag;

        this.setDisplayedOrVisible(neverDisplayed);
    }
}
