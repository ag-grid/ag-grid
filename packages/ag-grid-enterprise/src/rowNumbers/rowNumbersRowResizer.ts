import { Component, _getRowNode } from 'ag-grid-community';
import type { CellCtrl, ElementParams, IPinnedRowModel, IRowModel, IRowNode } from 'ag-grid-community';

const RowNumbersRowResizerElement: ElementParams = {
    tag: 'div',
    cls: 'ag-row-numbers-resizer',
};

export class AgRowNumbersRowResizer extends Component {
    private node: IRowNode | undefined;
    private initialYPosition: number = -1;
    private initialHeight: number | null | undefined;
    private dragging = false;
    private rowModel: IRowModel | IPinnedRowModel | undefined;

    constructor(private readonly cellCtrl: CellCtrl) {
        super(RowNumbersRowResizerElement);
    }

    public postConstruct() {
        const { beans, cellCtrl } = this;
        const { dragSvc, pinnedRowModel, rowModel } = beans;
        dragSvc!.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragStop: this.onDragStop.bind(this),
            onDragCancel: this.onDragCancel.bind(this),
        });

        const rowPosition = cellCtrl.getRowPosition();
        this.node = _getRowNode(this.beans, rowPosition);
        this.rowModel = rowPosition.rowPinned ? pinnedRowModel : rowModel;
    }

    private onDragStart(mouseEvent: MouseEvent | Touch): void {
        if (!this.node) {
            return;
        }

        this.dragging = true;
        this.initialHeight = this.node.rowHeight as number;
        this.beans.eventSvc.dispatchEvent({
            type: 'rowResizeStarted',
            node: this.node,
            event: mouseEvent,
            rowHeight: this.initialHeight,
        });
    }

    private onDragging(mouseEvent: MouseEvent | Touch): void {
        const { clientY } = mouseEvent;

        if (this.initialYPosition === -1 || !this.dragging) {
            this.initialYPosition = clientY;
            return;
        }

        const { initialHeight, initialYPosition } = this;

        if (initialHeight == null) {
            return;
        }

        const currentSize = this.node?.rowHeight;
        const newSize = Math.max(initialHeight - (initialYPosition - clientY), 1);

        this.cellCtrl.comp.toggleCss('ag-row-height-zero', newSize <= 2);

        if (currentSize === newSize) {
            return;
        }

        this.node?.setRowHeight(newSize);
        if (this.node?.rowPinned || !(this.rowModel as any).onRowHeightChanged) {
            this.beans.rowRenderer.redraw({ afterScroll: true });
        } else {
            (this.rowModel as any).onRowHeightChanged({ animate: false });
        }
    }

    private onDragStop(mouseEvent: MouseEvent | Touch): void {
        this.beans.eventSvc.dispatchEvent({
            type: 'rowResizeEnded',
            node: this.node!,
            event: mouseEvent,
            rowHeight: this.node?.rowHeight as number,
        });

        this.clearDragDetails();
    }

    private onDragCancel(): void {
        this.clearDragDetails();
    }

    private clearDragDetails(): void {
        this.initialYPosition = -1;
        this.initialHeight = null;
    }

    public override destroy(): void {
        this.clearDragDetails();
        this.node = undefined;
        this.rowModel = undefined;
        super.destroy();
    }
}
