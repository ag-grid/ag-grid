import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { IRowDropHighlightService, RowDropHighlightPosition } from '../interfaces/IRowDropHighlightService';

export class RowDropHighlightService extends BeanStub implements NamedBean, IRowDropHighlightService {
    beanName = 'rowDropHighlightSvc' as const;

    private uiLevel = 0;
    public row: RowNode | null = null;
    public position: RowDropHighlightPosition = 'none';

    public postConstruct(): void {
        this.addManagedEventListeners({
            modelUpdated: this.onModelUpdated.bind(this),
        });
    }

    private onModelUpdated(): void {
        const row = this.row;
        if (!row || row.rowIndex === null || this.position === 'none') {
            this.clear();
        } else {
            this.set(row, this.position);
        }
    }

    public override destroy(): void {
        this.clear();
        super.destroy();
    }

    public clear(): void {
        const last = this.row;
        if (last) {
            this.uiLevel = 0;
            this.position = 'none';
            this.row = null;
            last.dispatchRowEvent('rowHighlightChanged');
        }
    }

    public set(row: RowNode, position: RowDropHighlightPosition): void {
        const nodeChanged = row !== this.row;
        const uiLevel = row.uiLevel;
        const highlightChanged = position !== this.position;
        const uiLevelChanged = uiLevel !== this.uiLevel;
        if (nodeChanged || highlightChanged || uiLevelChanged) {
            if (nodeChanged) {
                this.clear();
            }
            this.uiLevel = uiLevel;
            this.position = position;
            this.row = row;
            row.dispatchRowEvent('rowHighlightChanged');
        }
    }
}
