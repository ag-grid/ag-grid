import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import type { IRowDragItem } from '../interfaces/iRowDragItem';
import type { ElementParams } from '../utils/dom';
import { _createIconNoSpan } from '../utils/icon';
import { Component } from '../widgets/component';
import type { DragSource } from './dragAndDropService';
import { DragSourceType } from './dragAndDropService';

const RowDragElement: ElementParams = {
    tag: 'div',
    cls: 'ag-drag-handle ag-row-drag',
    attrs: { 'aria-hidden': 'true' },
};

export class RowDragComp extends Component {
    private dragSource: DragSource | null = null;
    private mouseDownListener: (() => void) | undefined;

    constructor(
        private readonly cellValueFn: () => string,
        private readonly rowNode: RowNode,
        private readonly column?: AgColumn,
        private readonly customGui?: HTMLElement,
        private readonly dragStartPixels?: number,
        private readonly suppressVisibilityChange?: boolean
    ) {
        super();
    }

    public isCustomGui(): boolean {
        return this.customGui != null;
    }

    public postConstruct(): void {
        const { beans, rowNode } = this;
        if (!this.customGui) {
            this.setTemplate(RowDragElement);
            this.getGui().appendChild(_createIconNoSpan('rowDrag', beans, null)!);
            this.addDragSource();
        } else {
            this.setDragElement(this.customGui, this.dragStartPixels);
        }

        if (!this.suppressVisibilityChange) {
            const refresh = this.refresh.bind(this);

            this.addManagedPropertyListener('suppressRowDrag', refresh);

            // in case data changes, then we need to update visibility of drag item
            this.addManagedListeners(rowNode, {
                dataChanged: refresh,
                cellChanged: refresh,
            });

            // For managed row drag, we do not show the component if sort, filter or grouping is active
            this.addManagedListeners<AgEventType>(beans.eventSvc, {
                sortChanged: refresh,
                filterChanged: refresh,
                columnRowGroupChanged: refresh,
                newColumnsLoaded: refresh,
            });
        }
    }

    public setDragElement(dragElement: HTMLElement, dragStartPixels?: number) {
        // We set suppressDataRefValidation as the drag element could contain AG Grid comps with data references
        // that are not part of this row dragger's context. Maybe this should just setGui and not setTemplateFromElement?
        this.setTemplateFromElement(dragElement, undefined, undefined, true);
        this.addDragSource(dragStartPixels);
    }

    public refresh(): void {
        if (this.suppressVisibilityChange) {
            return;
        }

        const { rowDragSvc, dragAndDrop, gos } = this.beans;
        const isManaged = gos.get('rowDragManaged');
        const suppressRowDrag = gos.get('suppressRowDrag');
        let neverDisplayed = false;
        let alwaysHidden = false;

        if (isManaged) {
            // Managed: only show if not prevented and not suppressed, or if there are external drop zones
            const shouldPreventRowMove = rowDragSvc!.rowDragFeature?.shouldPreventRowMove();
            const hasExternalDropZones = dragAndDrop?.hasExternalDropZones();
            neverDisplayed = (shouldPreventRowMove && !hasExternalDropZones) || suppressRowDrag;
            alwaysHidden = !!this.rowNode.footer;
        } else {
            // Non-managed: only show if not suppressed
            neverDisplayed = suppressRowDrag;
        }

        // Now, match the old setDisplayedOrVisible logic
        const displayedOptions = { skipAriaHidden: true };
        if (neverDisplayed) {
            this.setDisplayed(false, displayedOptions);
            return;
        }

        let shown = !alwaysHidden;
        let isShownSometimes = false;
        const column = this.column;
        if (column) {
            const rowDrag = column.getColDef().rowDrag;
            isShownSometimes = typeof rowDrag === 'function';
            shown = (alwaysHidden ? !!rowDrag : column.isRowDrag(this.rowNode)) || this.isCustomGui();
        }

        if (isShownSometimes) {
            this.setDisplayed(true, displayedOptions);
            this.setVisible(shown && !alwaysHidden, displayedOptions);
        } else {
            this.setDisplayed(shown, displayedOptions);
            this.setVisible(!alwaysHidden, displayedOptions);
        }
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
            dragItemName: () => {
                const dragItem = this.getDragItem();
                const dragItemCount = dragItem.rowNodes?.length || 1;

                const rowDragText = this.getRowDragText(this.column);
                if (rowDragText) {
                    return rowDragText(dragItem, dragItemCount);
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
