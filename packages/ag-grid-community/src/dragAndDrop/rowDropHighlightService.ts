import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { DropIndicatorPosition, IRowDropHighlightService } from '../interfaces/IRowDropHighlightService';

export class RowDropHighlightService extends BeanStub implements NamedBean, IRowDropHighlightService {
    beanName = 'rowDropHighlightSvc' as const;

    public row: RowNode | null = null;
    public position: DropIndicatorPosition = 'none';

    public postConstruct(): void {
        this.addManagedEventListeners({
            modelUpdated: this.onModelUpdated.bind(this),
        });
    }

    private onModelUpdated(): void {
        if (this.row?.rowIndex === null) {
            this.clear(); // Clear the highlight if the row was removed
        }
    }

    public override destroy(): void {
        this.clear();
        super.destroy();
    }

    public clear(): void {
        const last = this.row;
        if (last) {
            this.row = null;
            this.position = 'none';
            last.dispatchRowEvent('rowHighlightChanged');
        }
    }

    public set(row: RowNode, dropIndicatorPosition: Exclude<DropIndicatorPosition, 'none'>): void {
        const nodeChanged = row !== this.row;
        const highlightChanged = dropIndicatorPosition !== this.position;
        if (nodeChanged || highlightChanged) {
            if (nodeChanged) {
                this.clear();
            }
            this.row = row;
            this.position = dropIndicatorPosition;
            row.dispatchRowEvent('rowHighlightChanged');
        }
    }
}
