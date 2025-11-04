import { BeanStub } from 'ag-grid-community';
import type { IRowNode, RowGroupBulkExpansionState } from 'ag-grid-community';

import type { IExpansionStrategy } from './iExpansionStrategy';

export class ExpandAllStrategy extends BeanStub implements IExpansionStrategy<RowGroupBulkExpansionState> {
    name: string = 'expandAll';

    private allExpanded: boolean | undefined = undefined;
    private flipped: Set<string> = new Set();

    public setExpandedState(state: RowGroupBulkExpansionState): void {
        this.allExpanded = state.expandAll;
        this.flipped = new Set(state.invertedRowGroupIds);
    }

    public getExpandedState(): RowGroupBulkExpansionState {
        return {
            expandAll: this.allExpanded,
            invertedRowGroupIds: Array.from(this.flipped),
        };
    }

    public setRowExpanded(row: IRowNode, expanded: boolean) {
        const id = row.id!;
        if (expanded === this.allExpanded) {
            this.flipped.delete(id);
            return;
        }
        this.flipped.add(id);
    }

    public isRowExpanded(node: IRowNode): boolean {
        const rowId = node.id!;
        return this.allExpanded !== this.flipped.has(rowId);
    }

    public isRowInitialised(): boolean {
        return true;
    }

    public expandAll(expanded: boolean): void {
        this.allExpanded = expanded;
        this.flipped.clear();
    }
}
