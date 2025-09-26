import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import type { IRowDragItem } from '../interfaces/iRowDragItem';
import type { ElementParams } from '../utils/element';
import { _createIconNoSpan } from '../utils/icon';
import { Component } from '../widgets/component';
import type { GridDragSource } from './dragAndDropService';
import { DragSourceType } from './dragAndDropService';
import type { RowDraggingEvent } from './rowDragTypes';

const RowDragElement: ElementParams = {
    tag: 'div',
    cls: 'ag-drag-handle ag-row-drag',
    attrs: { 'aria-hidden': 'true' },
};

export class RowDragComp extends Component {
    private dragSource: GridDragSource<RowDraggingEvent> | null = null;
    private mouseDownListener: (() => void) | undefined;

    constructor(
        private readonly cellValueFn: () => string,
        private readonly rowNode: RowNode,
        private readonly column?: AgColumn,
        private readonly customGui?: HTMLElement,
        private readonly dragStartPixels?: number,
        private readonly alwaysVisible: boolean = false
    ) {
        super();
    }

    public isCustomGui(): boolean {
        return this.customGui != null;
    }

    public postConstruct(): void {
        const { beans, customGui } = this;
        if (customGui) {
            this.setDragElement(customGui, this.dragStartPixels);
        } else {
            this.setTemplate(RowDragElement);
            this.getGui().appendChild(_createIconNoSpan('rowDrag', beans, null)!);
            this.addDragSource();
        }

        if (!this.alwaysVisible) {
            this.initCellDrag();
        }
    }

    private initCellDrag(): void {
        const { beans, gos, rowNode } = this;
        const refreshVisibility = this.refreshVisibility.bind(this);

        this.addManagedPropertyListener('suppressRowDrag', refreshVisibility);

        // in case data changes, then we need to update visibility of drag item
        this.addManagedListeners(rowNode, {
            dataChanged: refreshVisibility,
            cellChanged: refreshVisibility,
        });

        this.addManagedListeners<AgEventType>(
            beans.eventSvc,
            // For managed row drag, we do not show the component if sort, filter or grouping is active
            gos.get('rowDragManaged')
                ? {
                      sortChanged: refreshVisibility,
                      filterChanged: refreshVisibility,
                      columnRowGroupChanged: refreshVisibility,
                      newColumnsLoaded: refreshVisibility,
                  }
                : { newColumnsLoaded: refreshVisibility }
        );
    }

    public setDragElement(dragElement: HTMLElement, dragStartPixels?: number) {
        // We set suppressDataRefValidation as the drag element could contain AG Grid comps with data references
        // that are not part of this row dragger's context. Maybe this should just setGui and not setTemplateFromElement?
        this.setTemplateFromElement(dragElement, undefined, undefined, true);
        this.addDragSource(dragStartPixels);
    }

    public refreshVisibility(): void {
        if (this.alwaysVisible) {
            return; // Always visible row draggers do not refresh visibility
        }

        const displayedOptions = { skipAriaHidden: true };
        if (this.isNeverDisplayed()) {
            this.setDisplayed(false, displayedOptions);
            return;
        }

        const column = this.column;

        // if shown sometimes, them some rows can have drag handle while other don't,
        // so we use setVisible to keep the handles horizontally aligned (as _setVisible
        // keeps the empty space, whereas setDisplayed looses the space)
        let shownSometimes = typeof column?.getColDef().rowDrag === 'function';
        let visible = !column || this.isCustomGui() || column.isRowDrag(this.rowNode);
        if (visible && this.rowNode.footer && this.gos.get('rowDragManaged')) {
            visible = false; // We hide footer rows in row drag managed mode
            shownSometimes = true;
        }

        this.setDisplayed(shownSometimes || visible, displayedOptions);
        this.setVisible(visible, displayedOptions);
    }

    private isNeverDisplayed(): boolean {
        const { gos, beans } = this;
        if (gos.get('suppressRowDrag')) {
            return true; // Row dragging is suppressed
        }

        if (
            gos.get('rowDragManaged') &&
            !!beans.rowDragSvc!.rowDragFeature?.shouldPreventRowMove() &&
            !beans.dragAndDrop?.hasExternalDropZones()
        ) {
            return true; // Managed: only show if not prevented and not suppressed, or if there are external drop zones
        }

        return false;
    }

    private getSelectedNodes(): RowNode[] {
        const rowNode = this.rowNode;
        const isRowDragMultiRow = this.gos.get('rowDragMultiRow');
        if (!isRowDragMultiRow) {
            return [rowNode];
        }

        const selection = this.beans.selectionSvc?.getSelectedNodes() ?? [];

        return selection.indexOf(rowNode) !== -1 ? selection : [rowNode];
    }

    private getDragItem(): IRowDragItem {
        const { column, rowNode } = this;
        return {
            rowNode,
            rowNodes: this.getSelectedNodes(),
            columns: column ? [column] : undefined,
            defaultTextValue: this.cellValueFn(),
        };
    }

    private getRowDragText(column?: AgColumn) {
        if (column) {
            const colDef = column.getColDef();
            if (colDef.rowDragText) {
                return colDef.rowDragText;
            }
        }
        return this.gos.get('rowDragText');
    }

    private addDragSource(dragStartPixels: number = 4): void {
        // if this is changing the drag element, delete the previous dragSource
        if (this.dragSource) {
            this.removeDragSource();
        }

        if (this.gos.get('rowDragManaged') && this.rowNode.footer) {
            return; // Footer nodes in row drag managed mode are not draggable
        }

        const eGui = this.getGui();

        if (this.gos.get('enableCellTextSelection')) {
            this.removeMouseDownListener();

            this.mouseDownListener = this.addManagedElementListeners(eGui, {
                mousedown: (e) => {
                    e?.preventDefault();
                },
            })[0];
        }

        const translate = this.getLocaleTextFunc();

        this.dragSource = {
            type: DragSourceType.RowDrag,
            eElement: eGui,
            dragItemName: (draggingEvent) => {
                const dragItem = draggingEvent?.dragItem || this.getDragItem();
                const dragItemCount = (draggingEvent?.dropTarget?.rows.length ?? dragItem.rowNodes?.length) || 1;

                const rowDragText = this.getRowDragText(this.column);
                if (rowDragText) {
                    return rowDragText(dragItem as IRowDragItem, dragItemCount);
                }

                return dragItemCount === 1
                    ? this.cellValueFn()
                    : `${dragItemCount} ${translate('rowDragRows', 'rows')}`;
            },
            getDragItem: () => this.getDragItem(),
            dragStartPixels,
            dragSourceDomDataKey: this.gos.getDomDataKey(),
        };

        this.beans.dragAndDrop!.addDragSource(this.dragSource, true);
    }

    public override destroy(): void {
        this.removeDragSource();
        this.removeMouseDownListener();
        super.destroy();
    }

    private removeDragSource() {
        if (!this.dragSource) {
            return;
        }

        this.beans.dragAndDrop!.removeDragSource(this.dragSource);
        this.dragSource = null;
    }

    private removeMouseDownListener() {
        if (!this.mouseDownListener) {
            return;
        }

        this.mouseDownListener();
        this.mouseDownListener = undefined;
    }
}
