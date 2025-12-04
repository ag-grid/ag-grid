import type { LocaleTextFunc } from '../agStack/interfaces/iLocaleService';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
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

const SKIP_ARIA_HIDDEN = { skipAriaHidden: true };

export class RowDragComp extends Component {
    private dragSource: GridDragSource<RowDraggingEvent> | null = null;
    private mouseDownListener: (() => void) | undefined;
    private disabled = false;

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
        const { beans, rowNode } = this;
        const refreshVisibility = this.refreshVisibility.bind(this);

        this.addManagedListeners(beans.eventSvc, {
            rowDragVisibilityChanged: refreshVisibility,
        });

        // in case data changes, then we need to update visibility of drag item
        this.addManagedListeners(rowNode, {
            dataChanged: refreshVisibility,
            cellChanged: refreshVisibility,
        });

        this.refreshVisibility();
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

        const { beans, column, rowNode } = this;
        const { gos, dragAndDrop, rowDragSvc } = beans;
        const visibility = rowDragSvc?.visibility;
        const hide = visibility === 'suppress' || (visibility === 'hidden' && !dragAndDrop?.hasExternalDropZones());

        let displayed = !hide;
        let visible = displayed;

        if (displayed && !this.isCustomGui() && column) {
            const rowDragProp = column.getColDef().rowDrag;
            if (rowDragProp === false) {
                displayed = false;
            } else {
                const shownSometimes = typeof rowDragProp === 'function';
                visible = column.isRowDrag(rowNode);
                displayed = shownSometimes || visible;
            }
        }

        if (displayed && visible && rowNode.footer && gos.get('rowDragManaged')) {
            visible = false; // Footer rows in managed mode never show drag handles
            displayed = true;
        }

        visible &&= displayed;

        // Those calls are ordered to avoid flicker when changing state

        if (!displayed) {
            this.setDisplayed(displayed, SKIP_ARIA_HIDDEN);
        }
        if (!visible) {
            this.setVisible(visible, SKIP_ARIA_HIDDEN);
        }

        this.setDisabled(!visible || (visibility === 'disabled' && !dragAndDrop?.hasExternalDropZones()));

        if (displayed) {
            this.setDisplayed(displayed, SKIP_ARIA_HIDDEN);
        }
        if (visible) {
            this.setVisible(visible, SKIP_ARIA_HIDDEN);
        }
    }

    private setDisabled(disabled: boolean): void {
        if (disabled !== this.disabled) {
            this.disabled = disabled;
            this.getGui()?.classList?.toggle('ag-drag-handle-disabled', disabled);
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
            dragItemName: (draggingEvent) => this.getDragItemName(draggingEvent, translate),
            getDragItem: () => this.getDragItem(),
            dragStartPixels,
            dragSourceDomDataKey: this.gos.getDomDataKey(),
        };

        this.beans.dragAndDrop!.addDragSource(this.dragSource, true);
    }

    private getDragItemName(draggingEvent: RowDraggingEvent | null | undefined, translate: LocaleTextFunc): string {
        const dragItem = draggingEvent?.dragItem || this.getDragItem();
        const dragItemCount = (draggingEvent?.dropTarget?.rows.length ?? dragItem.rowNodes?.length) || 1;

        const rowDragTextGetter = this.column?.getColDef()?.rowDragText ?? this.gos.get('rowDragText');
        if (rowDragTextGetter) {
            return rowDragTextGetter(dragItem as IRowDragItem, dragItemCount);
        }

        if (dragItemCount !== 1) {
            return `${dragItemCount} ${translate('rowDragRows', 'rows')}`;
        }

        const value = this.cellValueFn();
        if (value) {
            return value;
        }

        return `1 ${translate('rowDragRow', 'rows')}`;
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
