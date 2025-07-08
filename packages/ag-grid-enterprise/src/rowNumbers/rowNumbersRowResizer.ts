import { Component, Direction, _getRowNode } from 'ag-grid-community';
import type { CellCtrl, ElementParams, RowNode } from 'ag-grid-community';

const RowNumbersRowResizerElement: ElementParams = {
    tag: 'div',
    cls: 'ag-row-numbers-resizer',
};

export class AgRowNumbersRowResizer extends Component {
    private node: RowNode | undefined;
    private initialYPosition: number = -1;
    private initialHeight: number | null | undefined;
    private dragging = false;
    private defaultRowHeight: number;

    constructor(private readonly cellCtrl: CellCtrl) {
        super(RowNumbersRowResizerElement);
    }

    public postConstruct() {
        const { beans, cellCtrl } = this;
        const { dragSvc, environment } = beans;
        this.defaultRowHeight = environment.getDefaultRowHeight();

        dragSvc!.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragStop: this.onDragStop.bind(this),
            onDragCancel: this.onDragCancel.bind(this),
            includeTouch: true,
            stopPropagationForTouch: true,
        });

        const rowPosition = cellCtrl.getRowPosition();

        this.node = _getRowNode(this.beans, rowPosition);
    }

    private onDragStart(mouseEvent: MouseEvent | Touch): void {
        if (!this.node) {
            return;
        }

        const {
            beans: { ctrlsSvc, eventSvc },
        } = this;

        const ctrl = ctrlsSvc.get('gridCtrl');
        ctrl.setResizeCursor(Direction.Vertical);

        this.dragging = true;
        this.initialHeight = this.node.rowHeight as number;
        eventSvc.dispatchEvent({
            type: 'rowResizeStarted',
            node: this.node,
            event: mouseEvent,
            rowHeight: this.initialHeight,
        });
    }

    private onDragging(mouseEvent: MouseEvent | Touch): void {
        let { clientY } = mouseEvent;

        if (this.cellCtrl.rowNode.rowPinned === 'bottom') {
            clientY *= -1;
        }

        if (this.initialYPosition === -1 || !this.dragging) {
            this.initialYPosition = clientY;
            return;
        }

        const { beans, initialHeight, initialYPosition, defaultRowHeight, node } = this;

        if (initialHeight == null) {
            return;
        }

        const currentSize = node?.rowHeight;
        const newSize = Math.max(initialHeight - (initialYPosition - clientY), defaultRowHeight);

        if (currentSize === newSize) {
            return;
        }

        node?.setRowHeight(newSize);

        const { rowRenderer, rowModel, pinnedRowModel } = beans;
        const pinned = !!node?.rowPinned;
        if (pinned) {
            rowRenderer.redraw({ afterScroll: true });
        }

        if (!pinned || pinnedRowModel?.isManual()) {
            (rowModel as any).onRowHeightChanged({ animate: false });
        }
    }

    private onDragStop(mouseEvent: MouseEvent | Touch): void {
        this.beans.eventSvc.dispatchEvent({
            type: 'rowResizeEnded',
            node: this.node!,
            event: mouseEvent,
            rowHeight: this.node?.rowHeight as number,
        });

        this.clearDragDetails(true);
    }

    private onDragCancel(): void {
        this.clearDragDetails(true);
    }

    private clearDragDetails(fromDragEvent: boolean): void {
        this.initialYPosition = -1;
        this.initialHeight = null;
        this.dragging = false;

        if (fromDragEvent) {
            const ctrl = this.beans.ctrlsSvc.get('gridCtrl');
            ctrl.setResizeCursor(false);
        }
    }

    public override destroy(): void {
        this.clearDragDetails(false);
        this.node = undefined;
        super.destroy();
    }
}
