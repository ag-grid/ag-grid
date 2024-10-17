import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { IColsService } from '../interfaces/iColsService';
import { _deepCloneDefinition } from '../utils/object';

export class ColumnDefFactory extends BeanStub implements NamedBean {
    beanName = 'columnDefFactory' as const;

    private rowGroupColsService?: IColsService;
    private pivotColsService?: IColsService;

    public wireBeans(beans: BeanCollection): void {
        this.rowGroupColsService = beans.rowGroupColsService;
        this.pivotColsService = beans.pivotColsService;
    }

    public getColumnDefs(
        colDefColsList: AgColumn[],
        showingPivotResult: boolean,
        lastOrder: AgColumn[] | null,
        colsList: AgColumn[]
    ): (ColDef | ColGroupDef)[] | undefined {
        const cols = colDefColsList.slice();

        if (showingPivotResult) {
            cols.sort((a, b) => lastOrder!.indexOf(a) - lastOrder!.indexOf(b));
        } else if (lastOrder) {
            cols.sort((a, b) => colsList.indexOf(a) - colsList.indexOf(b));
        }

        const rowGroupColumns = this.rowGroupColsService?.columns ?? [];
        const pivotColumns = this.pivotColsService?.columns ?? [];

        return this.buildColumnDefs(cols, rowGroupColumns, pivotColumns);
    }

    private buildColumnDefs(
        cols: AgColumn[],
        rowGroupColumns: AgColumn[],
        pivotColumns: AgColumn[]
    ): (ColDef | ColGroupDef)[] {
        const res: (ColDef | ColGroupDef)[] = [];

        const colGroupDefs: { [id: string]: ColGroupDef } = {};

        cols.forEach((col: AgColumn) => {
            const colDef = this.createDefFromColumn(col, rowGroupColumns, pivotColumns);

            let addToResult = true;

            let childDef: ColDef | ColGroupDef = colDef;

            let pointer = col.getOriginalParent();
            let lastPointer: AgProvidedColumnGroup | null = null;
            while (pointer) {
                let parentDef: ColGroupDef | null | undefined = null;

                // we don't include padding groups, as the column groups provided
                // by application didn't have these. the whole point of padding groups
                // is to balance the column tree that the user provided.
                if (pointer.isPadding()) {
                    pointer = pointer.getOriginalParent();
                    continue;
                }

                // if colDef for this group already exists, use it
                const existingParentDef = colGroupDefs[pointer.getGroupId()];
                if (existingParentDef) {
                    existingParentDef.children.push(childDef);
                    // if we added to result, it would be the second time we did it
                    addToResult = false;
                    // we don't want to continue up the tree, as it has already been
                    // done for this group
                    break;
                }

                parentDef = this.createDefFromGroup(pointer);

                if (parentDef) {
                    parentDef.children = [childDef];
                    colGroupDefs[parentDef.groupId!] = parentDef;
                    childDef = parentDef;
                    pointer = pointer.getOriginalParent();
                }

                if (pointer != null && lastPointer === pointer) {
                    addToResult = false;
                    break;
                }
                // Ensure we don't get stuck in an infinite loop
                lastPointer = pointer;
            }

            if (addToResult) {
                res.push(childDef);
            }
        });

        return res;
    }

    private createDefFromGroup(group: AgProvidedColumnGroup): ColGroupDef | null | undefined {
        const defCloned = _deepCloneDefinition(group.getColGroupDef(), ['children']);

        if (defCloned) {
            defCloned.groupId = group.getGroupId();
        }

        return defCloned;
    }

    private createDefFromColumn(col: AgColumn, rowGroupColumns: AgColumn[], pivotColumns: AgColumn[]): ColDef {
        const colDefCloned = _deepCloneDefinition(col.getColDef())!;

        colDefCloned.colId = col.getColId();

        colDefCloned.width = col.getActualWidth();
        colDefCloned.rowGroup = col.isRowGroupActive();
        colDefCloned.rowGroupIndex = col.isRowGroupActive() ? rowGroupColumns.indexOf(col) : null;
        colDefCloned.pivot = col.isPivotActive();
        colDefCloned.pivotIndex = col.isPivotActive() ? pivotColumns.indexOf(col) : null;
        colDefCloned.aggFunc = col.isValueActive() ? col.getAggFunc() : null;
        colDefCloned.hide = col.isVisible() ? undefined : true;
        colDefCloned.pinned = col.isPinned() ? col.getPinned() : null;

        colDefCloned.sort = col.getSort() ? col.getSort() : null;
        colDefCloned.sortIndex = col.getSortIndex() != null ? col.getSortIndex() : null;

        return colDefCloned;
    }
}
