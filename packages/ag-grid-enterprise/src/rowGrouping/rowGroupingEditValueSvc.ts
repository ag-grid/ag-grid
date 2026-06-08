import type {
    AgColumn,
    GroupRowValueSetterParams,
    IRowNode,
    NamedBean,
    RowNode,
    _IRowGroupingEditValueSvc,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { distributeGroupValue, resolveDistributionEntry } from './distributeGroupValue/distributeGroupValue';
import { resolveStrategy } from './distributeGroupValue/valueConversion';

export class RowGroupingEditValueSvc extends BeanStub implements NamedBean, _IRowGroupingEditValueSvc {
    beanName = 'rowGroupingEditValueSvc' as const;

    public isGroupCellEditable(rowNode: IRowNode, column: AgColumn): boolean {
        const colDef = column.colDef;

        if (!column.isColumnFunc(rowNode, colDef.groupRowEditable)) {
            return false;
        }

        const setter = colDef.groupRowValueSetter;

        // Function setter: always editable (user handles distribution)
        if (typeof setter === 'function') {
            return true;
        }

        const aggFunc = colDef.aggFunc ?? null;

        // Options object: resolve per-aggFunc records and defaults, then check strategy
        if (typeof setter === 'object') {
            const entry = resolveDistributionEntry(setter, aggFunc);
            return (
                typeof entry === 'function' ||
                (entry !== false && resolveStrategy(aggFunc, entry?.distribution) !== false)
            );
        }

        // No setter or true: check if the aggFunc's default strategy is enabled
        return resolveStrategy(aggFunc, setter ?? undefined) !== false;
    }

    public setGroupDataValue(
        rowNode: RowNode,
        column: AgColumn,
        newValue: unknown,
        oldValue: unknown,
        eventSource: string | undefined,
        valueChanged: boolean
    ): boolean | undefined {
        const colDef = column.colDef;

        // Resolve groupRowValueSetter: true or groupRowEditable → built-in distributeGroupValue,
        // false → explicitly disabled, function/object → as-is.
        // colDef is already deep-merged with defaultColDef (via _mergeDeep in colDefUtils),
        // so object-type options inherit and merge with defaultColDef automatically.
        // When groupRowEditable is a callback, evaluate it against the current row — only enable
        // implicit distribution for rows where the callback returns true.
        let setter = colDef.groupRowValueSetter;
        if (setter == null) {
            const gre = colDef.groupRowEditable;
            setter = gre && column.isColumnFunc(rowNode, gre) ? true : undefined;
        }
        if (!setter) {
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
            typeof setter === 'function'
                ? setter(params)
                : // true or options object — delegate to the built-in distributor.
                  distributeGroupValue(params, setter === true ? undefined : setter);

        // Default to true if user forgot to return a value (possible without TypeScript).
        return result ?? true;
    }
}
