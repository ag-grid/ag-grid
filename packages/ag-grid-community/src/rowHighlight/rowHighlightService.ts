import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { IRowHighlightService } from '../interfaces/IRowHighlightService';
import type { RowHighlightPosition } from './rowHighlightPosition';

export class RowHighlightService extends BeanStub implements NamedBean, IRowHighlightService {
    beanName = 'rowHighlightSvc' as const;

    public row: RowNode | null = null;
    public position: RowHighlightPosition | null = null;

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
            this.position = null;
            last.dispatchRowEvent('rowHighlightChanged');
            this.row = null;
        }
    }

    public set(row: RowNode, position: RowHighlightPosition): void {
        const nodeChanged = row !== this.row;
        const highlightChanged = position !== this.position;
        if (nodeChanged || highlightChanged) {
            if (nodeChanged) {
                this.clear();
            }
            this.position = position;
            this.row = row;
            row.dispatchRowEvent('rowHighlightChanged');
        }
    }
}
