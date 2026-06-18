import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColKind } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import { _applyColumnState } from './columnStateUtils';
import { _getColumnStateFromColDef } from './columnUtils';

/** Base for services owning a single optional generated column (selection, row-numbers); shared create/refresh/teardown.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseSingleColService extends BeanStub {
    /** The owned column, or null when disabled. Only ever 0 or 1 column — singular by design, no array allocation. */
    public column: AgColumn | null = null;

    /** The `AgColumn` kind discriminator for the generated column. */
    protected abstract readonly colKind: ColKind;

    /** Whether the column should currently exist, from grid options. */
    public abstract isEnabled(): boolean;

    /** Build the colDef for the column from current grid options. */
    protected abstract createColDef(): ColDef;

    public override destroy(): void {
        this.destroyColumn();
        super.destroy();
    }

    /** Generate or destroy the column based on current options. */
    public refreshCols(): AgColumn | null {
        const want = this.isEnabled();
        const existing = this.column;
        if (want && !existing) {
            const colDef = this.createColDef();
            const colId = colDef.colId!;
            this.gos.validateColDef(colDef, colId, true);
            const col = new AgColumn(colDef, null, colId, false, this.colKind);
            this.beans.context.createBean(col);
            this.column = col;
            return col;
        }
        if (!want && existing) {
            this.destroyColumn();
            return null;
        }
        return existing;
    }

    /** Rebuild the colDef on the existing column and re-apply its state. No-op when the column doesn't exist. */
    protected refreshColDef(source: ColumnEventType): void {
        const col = this.column;
        if (col) {
            const colDef = this.createColDef();
            col.setColDef(colDef, null, source);
            const beans = this.beans;
            _applyColumnState(beans, { state: [_getColumnStateFromColDef(beans, colDef, col.colId)] }, source);
        }
    }

    protected destroyColumn(): void {
        const existing = this.column;
        if (existing) {
            this.column = null;
            if (existing.isAlive()) {
                existing.destroy();
            }
        }
    }
}
