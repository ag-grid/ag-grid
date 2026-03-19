import type {
    AgColumn,
    GroupRowValueSetterParams,
    NamedBean,
    RowNode,
    _IRowGroupingEditValueSvc,
    _ModuleWithoutApi,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { distributeGroupValue } from './distributeGroupValue/distributeGroupValue';
import { SharedRowGroupingModule } from './rowGroupingModule';

class RowGroupingEditValueSvc extends BeanStub implements NamedBean, _IRowGroupingEditValueSvc {
    beanName = 'rowGroupingEditValueSvc' as const;

    public setGroupDataValue(
        rowNode: RowNode,
        column: AgColumn,
        newValue: unknown,
        oldValue: unknown,
        eventSource: string | undefined,
        valueChanged: boolean
    ): boolean | undefined {
        const colDef = column.getColDef();

        // Resolve groupRowValueSetter: true or groupRowEditable → built-in distributeGroupValue,
        // false → explicitly disabled, function/object → as-is.
        // colDef is already deep-merged with defaultColDef (via _mergeDeep in columnFactoryUtils),
        // so object-type options inherit and merge with defaultColDef automatically.
        // When groupRowEditable is a callback, evaluate it against the current row — only enable
        // implicit distribution for rows where the callback returns true.
        let raw = colDef.groupRowValueSetter;
        if (raw == null) {
            const gre = colDef.groupRowEditable;
            raw = gre && column.isColumnFunc(rowNode, gre) ? true : undefined;
        }
        if (!raw) {
            return undefined; // No groupRowValueSetter or false → caller uses normal path.
        }

        const params: GroupRowValueSetterParams = this.gos.addCommon({
            node: rowNode,
            data: rowNode.data,
            oldValue,
            newValue,
            colDef,
            column,
            eventSource,
            valueChanged,
            aggregatedChildren: this.beans.aggChildrenSvc?.getAggregatedChildren(rowNode, column) ?? [],
        });

        const result =
            typeof raw === 'function'
                ? raw(params)
                : // true or options object — delegate to the built-in distributor.
                  distributeGroupValue(params, raw === true ? undefined : raw);

        // Default to true if user forgot to return a value (possible without TypeScript).
        return result ?? true;
    }
}

/**
 * @feature Editing -> Group Row Edit
 * Enables `groupRowEditable` and `groupRowValueSetter` on group rows.
 * When `groupRowEditable` is set but no `groupRowValueSetter` is provided,
 * the module supplies a default that distributes the edited value to
 * descendant rows using {@link distributeGroupValue}.
 */
export const RowGroupingEditModule: _ModuleWithoutApi = {
    moduleName: 'RowGroupingEdit',
    version: VERSION,
    beans: [RowGroupingEditValueSvc],
    dependsOn: [EnterpriseCoreModule, SharedRowGroupingModule],
};
