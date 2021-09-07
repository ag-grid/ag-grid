import { ColDef, ColGroupDef } from "../entities/colDef";
import { Column } from "../entities/column";
import { Bean } from "../context/context";
import { deepCloneDefinition } from "../utils/object";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";

@Bean('columnDefFactory')
export class ColumnDefFactory {

    public buildColumnDefs(cols: Column[], rowGroupColumns: Column[], pivotColumns: Column[]): (ColDef | ColGroupDef)[] {

        const res: (ColDef | ColGroupDef)[] = [];

        const colGroupDefs: {[id: string]: ColGroupDef} = {};

        cols.forEach(col => {
            const colDef = this.createDefFromColumn(col, rowGroupColumns, pivotColumns);

            let addToResult = true;

            let childDef: ColDef | ColGroupDef = colDef;

            let pointer = col.getOriginalParent();

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
            }

            if (addToResult) {
                res.push(childDef);
            }
        });

        return res;
    }

    private createDefFromGroup(group: ProvidedColumnGroup): ColGroupDef | null | undefined {
        const defCloned = deepCloneDefinition(group.getColGroupDef(), ['children']);

        if (defCloned) {
            defCloned.groupId = group.getGroupId();
        }

        return defCloned;
    }

    private createDefFromColumn(col: Column, rowGroupColumns: Column[], pivotColumns: Column[]): ColDef {
        const colDefCloned = deepCloneDefinition(col.getColDef())!;

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