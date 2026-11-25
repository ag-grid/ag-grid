import type {
    AgColumn,
    ColDef,
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

    /** Columns whose function `groupRowValueSetter` is running, so writes to their child groups are distribution. */
    private readonly distributingCols = new Set<AgColumn>();

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

        // The built-in distribution cannot invert aggValueGetter, so only a function setter makes the cell editable
        if (this.beans.valueSvc.appliesAggValueGetter(column, rowNode)) {
            return false;
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

    public isDistributing(column: AgColumn): boolean {
        return this.distributingCols.has(column);
    }

    public getAggGetterEditMode(rowNode: IRowNode, column: AgColumn): 'setter' | 'reject' | undefined {
        const setter = this.resolveSetter(rowNode, column);
        if (!setter) {
            return undefined;
        }
        // The built-in distribution cannot reverse aggValueGetter, so only a function setter may change the data
        return typeof setter === 'function' ? 'setter' : 'reject';
    }

    /**
     * Resolves groupRowValueSetter: true or groupRowEditable → built-in distributeGroupValue,
     * false → explicitly disabled, function/object → as-is.
     * colDef is already deep-merged with defaultColDef (via _mergeDeep in colDefUtils),
     * so object-type options inherit and merge with defaultColDef automatically.
     * When groupRowEditable is a callback, evaluate it against the current row — only enable
     * implicit distribution for rows where the callback returns true.
     */
    private resolveSetter(rowNode: IRowNode, column: AgColumn): ColDef['groupRowValueSetter'] {
        const colDef = column.colDef;
        const setter = colDef.groupRowValueSetter;
        if (setter != null) {
            return setter;
        }
        const gre = colDef.groupRowEditable;
        return gre && column.isColumnFunc(rowNode, gre) ? true : undefined;
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
        const setter = this.resolveSetter(rowNode, column);
        if (!setter) {
            return undefined; // No groupRowValueSetter or false → caller uses normal path.
        }

        // A write to a child group while this column's function setter runs is distribution: its values are stored
        // aggregates (`ValueService.setValue` reads the old value raw then).
        const distributing = this.isDistributing(column);

        const params: GroupRowValueSetterParams = this.gos.addCommon({
            node: rowNode,
            data: rowNode.data,
            oldValue,
            newValue,
            colDef,
            column,
            eventSource,
            valueChanged,
            distributing,
            aggregatedChildren: this.beans.aggChildrenSvc?.getAggregatedChildren(rowNode, column) ?? [],
        });

        let result: boolean | void;
        if (typeof setter !== 'function') {
            // true or options object — delegate to the built-in distributor.
            result = distributeGroupValue(params, setter === true ? undefined : setter);
        } else if (distributing) {
            result = setter(params);
        } else {
            this.distributingCols.add(column);
            try {
                result = setter(params);
            } finally {
                this.distributingCols.delete(column);
            }
        }

        // Default to true if user forgot to return a value (possible without TypeScript).
        return result ?? true;
    }
}
