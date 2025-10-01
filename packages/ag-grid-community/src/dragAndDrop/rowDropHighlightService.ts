import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RowDraggingEvent } from './rowDragTypes';

export type DropIndicatorPosition = 'above' | 'inside' | 'below' | 'none';

export interface RowDropPositionIndicator<TData = any> {
    row: IRowNode<TData> | null;
    dropIndicatorPosition: DropIndicatorPosition;
}

export interface SetRowDropPositionIndicatorParams<TData = any> {
    row: IRowNode<TData> | null | undefined;
    dropIndicatorPosition: DropIndicatorPosition | null | false;
}

export class RowDropHighlightService extends BeanStub implements NamedBean {
    beanName = 'rowDropHighlightSvc' as const;

    private uiLevel = 0;
    private dragging = false;
    public row: RowNode | null = null;
    public position: DropIndicatorPosition = 'none';

    public postConstruct(): void {
        this.addManagedEventListeners({
            modelUpdated: this.onModelUpdated.bind(this),
        });
    }

    private onModelUpdated(): void {
        const row = this.row;
        const oldDragging = this.dragging;
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (!row || row?.rowIndex === null || this.position === 'none') {
            this.clear();
        } else {
            this.set(row, this.position);
        }
        this.dragging = oldDragging;
    }

    public override destroy(): void {
        this.clear();
        super.destroy();
    }

    public clear(): void {
        const last = this.row;
        this.dragging = false;
        if (last) {
            this.uiLevel = 0;
            this.position = 'none';
            this.row = null;
            last.dispatchRowEvent('rowHighlightChanged');
        }
    }

    public set(row: RowNode, dropIndicatorPosition: Exclude<DropIndicatorPosition, 'none'>): void {
        const nodeChanged = row !== this.row;
        const uiLevel = row.uiLevel;
        const highlightChanged = dropIndicatorPosition !== this.position;
        const uiLevelChanged = uiLevel !== this.uiLevel;
        this.dragging = false;
        if (nodeChanged || highlightChanged || uiLevelChanged) {
            if (nodeChanged) {
                this.clear();
            }
            this.uiLevel = uiLevel;
            this.position = dropIndicatorPosition;
            this.row = row;
            row.dispatchRowEvent('rowHighlightChanged');
        }
    }

    public fromDrag(draggingEvent: RowDraggingEvent | null): void {
        const rowsDrop = draggingEvent?.dropTarget;
        if (rowsDrop) {
            const { highlight, target, position } = rowsDrop;
            if (highlight && target && position !== 'none') {
                this.set(target as RowNode, position);
                this.dragging = true;
                return;
            }
        }
        if (this.dragging) {
            this.clear();
        }
    }
}
