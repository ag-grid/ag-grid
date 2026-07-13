import type { AgColumn, ColumnEventType, IRowGroupColsService, NamedBean } from 'ag-grid-community';
import { _clamp, _shouldUpdateColVisibilityAfterGroup, dispatchColumnVisibleEvent } from 'ag-grid-community';

import { OrderedColsService } from '../columns/orderedColsService';

export class RowGroupColsSvc extends OrderedColsService implements NamedBean, IRowGroupColsService {
    beanName = 'rowGroupColsSvc' as const;
    protected override eventName = 'columnRowGroupChanged' as const;
    protected override enableProp = 'rowGroup' as const;
    protected override indexProp = 'rowGroupIndex' as const;
    protected override initialEnableProp = 'initialRowGroup' as const;
    protected override initialIndexProp = 'initialRowGroupIndex' as const;

    private readonly pendingVisibilityChanges = new Set<AgColumn>();

    public moveColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void {
        const columns = this.columns;
        const len = columns.length;
        if (len === 0 || fromIndex < 0 || fromIndex >= len) {
            return;
        }
        toIndex = _clamp(toIndex, 0, len - 1);
        if (fromIndex === toIndex) {
            return;
        }
        const movedColumn = columns[fromIndex];
        const reordered = columns.slice();
        reordered.splice(toIndex, 0, reordered.splice(fromIndex, 1)[0]);
        this.resetActiveCols(reordered);
        // Reorder only (event-driven regroup): report the moved column.
        this.stageColChange(movedColumn);
        this.colModel.flushColChanges(source, false);
    }

    protected override onColActiveChanged(column: AgColumn, active: boolean, source: ColumnEventType): void {
        // Grouping auto-hides a col, ungrouping shows it again (batched `columnVisible` at flush); skip hierarchy virtuals (not user data).
        if (column.colKind !== 'hierarchy' && _shouldUpdateColVisibilityAfterGroup(this.gos, active)) {
            const visible = !active;
            if (column.visible !== visible) {
                column.setVisible(visible, source);
                this.pendingVisibilityChanges.add(column);
            }
        }
    }

    protected override onColActiveChangesComplete(source: ColumnEventType): void {
        const pending = this.pendingVisibilityChanges;
        if (pending.size) {
            const cols = Array.from(pending);
            pending.clear();
            dispatchColumnVisibleEvent(this.eventSvc, cols, source);
        }
    }

    protected override setActiveFlag(col: AgColumn, active: boolean): boolean {
        if (col.rowGroupActive === active) {
            return false;
        }
        col.rowGroupActive = active;
        return true;
    }

    /** Stamps each active col's position as its row-group level (`rowGroupActiveIndex`, valid only when active). */
    protected override onColumnsChanged(): void {
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            cols[i].rowGroupActiveIndex = i;
        }
    }
}
