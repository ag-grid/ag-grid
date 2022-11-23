import { Component } from "../../widgets/component";
import { Autowired, PostConstruct, PreDestroy } from "../../context/context";
import { RowNode } from "../../entities/rowNode";
import { DragItem, DragSource, DragSourceType } from "../../dragAndDrop/dragAndDropService";
import { Events } from "../../eventKeys";
import { Beans } from "../beans";
import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { createIconNoSpan } from "../../utils/icon";
import { doOnce, isFunction } from "../../utils/function";

export interface IRowDragItem extends DragItem {
    /** The default text that would be applied to this Drag Element */
    defaultTextValue: string;
}

export class RowDragComp extends Component {

    private dragSource: DragSource | null = null;

    @Autowired('beans') private readonly beans: Beans;

    constructor(
        private readonly cellValueFn: () => string,
        private readonly rowNode: RowNode,
        private readonly column?: Column,
        private readonly customGui?: HTMLElement,
        private readonly dragStartPixels?: number,
        private readonly suppressVisibilityChange?: boolean
    ) { super(); }

    public isCustomGui(): boolean {
        return this.customGui != null;
    }

    @PostConstruct
    private postConstruct(): void {
        if (!this.customGui) {
            this.setTemplate(/* html */ `<div class="ag-drag-handle ag-row-drag" aria-hidden="true"></div>`);
            this.getGui().appendChild(createIconNoSpan('rowDrag', this.beans.gridOptionsService, null)!);
            this.addDragSource();
        } else {
            this.setDragElement(this.customGui, this.dragStartPixels);
        }

        this.checkCompatibility();

        if (!this.suppressVisibilityChange) {
            const strategy = this.beans.gridOptionsService.is('rowDragManaged') ?
                new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column) :
                new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column);

            this.createManagedBean(strategy, this.beans.context);
        }
    }

    public setDragElement(dragElement: HTMLElement, dragStartPixels?: number) {
        this.setTemplateFromElement(dragElement);
        this.addDragSource(dragStartPixels);
    }

    private getSelectedNodes(): RowNode[] {
        const isRowDragMultiRow = this.beans.gridOptionsService.is('rowDragMultiRow');
        if (!isRowDragMultiRow) { return [this.rowNode]; }

        const selection = this.beans.selectionService.getSelectedNodes();

        return selection.indexOf(this.rowNode) !== -1 ? selection : [this.rowNode];
    }

    // returns true if all compatibility items work out
    private checkCompatibility(): void {
        const managed = this.beans.gridOptionsService.is('rowDragManaged');
        const treeData = this.beans.gridOptionsWrapper.isTreeData();

        if (treeData && managed) {
            doOnce(() =>
                console.warn('AG Grid: If using row drag with tree data, you cannot have rowDragManaged=true'),
                'RowDragComp.managedAndTreeData'
            );
        }
    }

    private getDragItem(): IRowDragItem {
        return {
            rowNode: this.rowNode,
            rowNodes: this.getSelectedNodes(),
            columns: this.column ? [this.column] : undefined,
            defaultTextValue: this.cellValueFn(),
        };
    }

    private addDragSource(dragStartPixels: number = 4): void {
        // if this is changing the drag element, delete the previous dragSource
        if (this.dragSource) { this.removeDragSource(); }

        const rowDragText = this.gridOptionsWrapper.getRowDragText(this.column);
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.dragSource = {
            type: DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: () => {
                const dragItem = this.getDragItem();
                const dragItemCount = dragItem.rowNodes?.length || 1;

                if (rowDragText) {
                    return rowDragText(dragItem, dragItemCount);
                }

                return dragItemCount === 1 ? this.cellValueFn() : `${dragItemCount} ${translate('rowDragRows', 'rows')}`;
            },
            getDragItem: () => this.getDragItem(),
            dragStartPixels,
            dragSourceDomDataKey: this.beans.gridOptionsWrapper.getDomDataKey()
        };

        this.beans.dragAndDropService.addDragSource(this.dragSource, true);
    }

    @PreDestroy
    private removeDragSource() {
        if (this.dragSource) {
            this.beans.dragAndDropService.removeDragSource(this.dragSource);
        }
        this.dragSource = null;
    }
}

class VisibilityStrategy extends BeanStub {
    private readonly parent: RowDragComp;
    private readonly column: Column | undefined;
    protected readonly rowNode: RowNode;

    constructor(parent: RowDragComp, rowNode: RowNode, column?: Column) {
        super();
        this.parent = parent;
        this.rowNode = rowNode;
        this.column = column;
    }

    protected setDisplayedOrVisible(neverDisplayed: boolean): void {
        const displayedOptions = { skipAriaHidden: true };
        if (neverDisplayed) {
            this.parent.setDisplayed(false, displayedOptions);
        } else {
            let shown: boolean = true;
            let isShownSometimes: boolean = false;

            if (this.column) {
                shown = this.column.isRowDrag(this.rowNode) || this.parent.isCustomGui();
                isShownSometimes = isFunction(this.column.getColDef().rowDrag);
            }

            // if shown sometimes, them some rows can have drag handle while other don't,
            // so we use setVisible to keep the handles horizontally aligned (as setVisible
            // keeps the empty space, whereas setDisplayed looses the space)
            if (isShownSometimes) {
                this.parent.setDisplayed(true, displayedOptions);
                this.parent.setVisible(shown, displayedOptions);
            } else {
                this.parent.setDisplayed(shown, displayedOptions);
                this.parent.setVisible(true, displayedOptions);
            }
        }
    }
}

// when non managed, the visibility depends on suppressRowDrag property only
class NonManagedVisibilityStrategy extends VisibilityStrategy {
    private readonly beans: Beans;

    constructor(parent: RowDragComp, beans: Beans, rowNode: RowNode, column?: Column) {
        super(parent, rowNode, column);
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));

        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.workOutVisibility.bind(this));

        this.workOutVisibility();
    }

    private onSuppressRowDrag(): void {
        this.workOutVisibility();
    }

    private workOutVisibility(): void {
        // only show the drag if both sort and filter are not present
        const neverDisplayed = this.beans.gridOptionsService.is('suppressRowDrag');
        this.setDisplayedOrVisible(neverDisplayed);
    }
}

// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
class ManagedVisibilityStrategy extends VisibilityStrategy {

    private readonly beans: Beans;

    constructor(parent: RowDragComp, beans: Beans, rowNode: RowNode, column?: Column) {
        super(parent, rowNode, column);
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        // we do not show the component if sort, filter or grouping is active

        this.addManagedListener(this.beans.eventService, Events.EVENT_SORT_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_FILTER_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.workOutVisibility.bind(this));

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
        const gridBodyCon = this.beans.ctrlsService.getGridBodyCtrl();
        const rowDragFeature = gridBodyCon.getRowDragFeature();
        const shouldPreventRowMove = rowDragFeature && rowDragFeature.shouldPreventRowMove();
        const suppressRowDrag = this.beans.gridOptionsService.is('suppressRowDrag');
        const hasExternalDropZones = this.beans.dragAndDropService.hasExternalDropZones();
        const neverDisplayed = (shouldPreventRowMove && !hasExternalDropZones) || suppressRowDrag;

        this.setDisplayedOrVisible(neverDisplayed);
    }
}
