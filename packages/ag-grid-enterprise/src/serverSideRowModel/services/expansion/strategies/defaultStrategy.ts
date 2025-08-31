import { BeanStub } from 'ag-grid-community';
import type {
    IRowNode,
    IsServerSideGroupOpenByDefaultParams,
    RowGroupExpansionState,
    WithoutGridCommon,
} from 'ag-grid-community';

import type { IExpansionStrategy } from './iExpansionStrategy';

export class ExpandStrategy extends BeanStub implements IExpansionStrategy<RowGroupExpansionState> {
    name: string = 'expand';

    private expanded: Set<string> = new Set();
    private collapsed: Set<string> = new Set();
    private initialState: Map<string, boolean> = new Map();

    /**
     * Set the expanded and collapsed rows.
     * @param expandedRows the rows to expand
     * @param touchedRows the rows that have been touched
     */
    public setExpandedState({ expandedRowGroupIds, collapsedRowGroupIds }: RowGroupExpansionState) {
        this.expanded = new Set(expandedRowGroupIds);
        this.collapsed = new Set(collapsedRowGroupIds);

        // if node is in expanded, initial state was false
        for (const node of this.expanded) {
            this.initialState.set(node, false);
        }

        // if node is in collapsed, initial state was true
        for (const node of this.collapsed) {
            this.initialState.set(node, true);
        }
    }

    /**
     * Get the serializable expanded state
     * @returns an object containing the expanded and collapsed rows
     */
    public getExpandedState(): RowGroupExpansionState {
        return {
            expandedRowGroupIds: Array.from(this.expanded),
            collapsedRowGroupIds: Array.from(this.collapsed),
        };
    }

    /**
     * Set the expanded state for a row.
     * @param row the row to expand/collapse
     * @param expanded true to expand the row, false to collapse it
     */
    public setRowExpanded(row: IRowNode, expanded: boolean) {
        const id = row.id!;
        const stateIsDefault = this.initialState.get(id) === expanded;
        if (expanded) {
            this.collapsed.delete(id);
            if (!stateIsDefault) {
                this.expanded.add(id);
            }
            return;
        }

        this.expanded.delete(id);
        if (!stateIsDefault) {
            this.collapsed.add(id);
        }
    }

    /**
     * Check if a row is expanded.
     * @param rowId the row id to check
     * @returns true if the row is expanded
     */
    public isRowExpanded(node: IRowNode): boolean {
        const rowId = node.id!;
        if (this.expanded.has(rowId)) {
            return true;
        }

        if (this.collapsed.has(rowId)) {
            return false;
        }

        const initialVal = this.initialState.get(rowId);
        if (initialVal != null) {
            return initialVal;
        }

        const initial = this.getInitialRowState(node);
        this.initialState.set(rowId, initial);
        return initial;
    }

    /**
     * This is different from just checking expandedState.isExpanded(rowNode.id),
     * as this correctly prioritizes user interaction over the user-defined initial state.
     * Plus sanity checks that the rowNode is actually expandable.
     */
    private getInitialRowState(rowNode: IRowNode): boolean {
        if (!rowNode.isExpandable()) {
            return false;
        }

        const userFunc = this.gos.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return false;
        }

        const params: WithoutGridCommon<IsServerSideGroupOpenByDefaultParams> = {
            data: rowNode.data,
            rowNode,
        };

        return userFunc(params);
    }

    /**
     * if the row is expanded or has been collapsed intentionally, do not apply initial state.
     * @param rowId the row id to check
     * @returns true if the row has been toggled
     */
    public isRowInitialised(rowId: string): boolean {
        return this.initialState.has(rowId);
    }

    /**
     * Expand or collapse all loaded rows.
     * @param expanded true to expand all rows, false to collapse all rows
     */
    public expandAll(expanded: boolean): void {
        this.beans.rowModel.forEachNode((node) => {
            this.setRowExpanded(node, expanded);
        });
    }
}
