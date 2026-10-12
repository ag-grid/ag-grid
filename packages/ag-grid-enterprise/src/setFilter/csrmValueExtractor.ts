import type { AgColumn, IClientSideRowModel, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { mapFormattedKeys, processDataPath, setFilterNullIfBlank } from './setFilterUtils';

/** @param V type of value in the Set Filter */
export class CsrmValuesExtractor<V> extends BeanStub {
    /** Both written by the value model with each column definition update, so rows are read and keyed the current way. */
    public createKey: (value: V | null | undefined, node?: RowNode | null) => string | null;
    public getValue: (node: RowNode) => V | null | undefined;

    constructor(
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
        private readonly isTreeDataOrGrouping: () => boolean,
        private readonly isTreeData: () => boolean
    ) {
        super();
    }

    /** `predicate` is `null` to read every row. */
    public extractUniqueValues(
        predicate: ((node: RowNode) => boolean) | null,
        existingValues?: Map<string | null, V | null>
    ): Map<string | null, V | null> {
        const values: Map<string | null, V | null> = new Map();
        const caseFormat = this.caseFormat;
        const existingFormattedKeys = existingValues && mapFormattedKeys(existingValues.keys(), caseFormat);
        const formattedKeys: Set<string | null> = new Set();
        const treeData = this.isTreeData();
        const treeDataOrGrouping = this.isTreeDataOrGrouping();
        const beans = this.beans;
        const groupedCols = beans.rowGroupColsSvc?.columns;
        const groupAllowUnbalanced = this.gos.get('groupAllowUnbalanced');

        const addValue = (unformattedKey: string | null, value: V | null | undefined) => {
            const formattedKey = caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                let keyToAdd = unformattedKey;
                let valueToAdd = setFilterNullIfBlank(value);
                // when case insensitive, we pick the first value to use. if this is later filtered out,
                // we still want to use the original value and not one with a different case
                const existingUnformattedKey = existingFormattedKeys?.get(formattedKey);
                if (existingUnformattedKey != null) {
                    keyToAdd = existingUnformattedKey;
                    valueToAdd = existingValues!.get(existingUnformattedKey)!;
                }
                values.set(keyToAdd, valueToAdd);
            }
        };

        (beans.rowModel as IClientSideRowModel).forEachLeafNode((node) => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || (predicate && !predicate(node))) {
                return;
            }
            if (treeDataOrGrouping) {
                this.addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue, groupAllowUnbalanced);
                return;
            }

            const value = this.getValue(node);

            if (value != null && Array.isArray(value)) {
                for (const x of value) {
                    addValue(this.createKey(x, node), x);
                }
                if (value.length === 0) {
                    addValue(null, null);
                }
            } else {
                addValue(this.createKey(value, node), value);
            }
        });

        return values;
    }

    private addValueForTreeDataOrGrouping(
        node: RowNode,
        treeData: boolean,
        groupedCols: AgColumn[] = [],
        addValue: (unformattedKey: string | null, value: V | null) => void,
        groupAllowUnbalanced: boolean
    ): void {
        let dataPath: string[] | null;
        if (treeData) {
            if (node.childrenAfterGroup?.length) {
                return;
            }
            dataPath = node.getRoute() ?? [node.key ?? node.id!];
        } else {
            dataPath = groupedCols.map((groupCol) => this.beans.valueSvc.getKeyForNode(groupCol, node));
            dataPath.push(this.getValue(node) as any);
        }
        const processedDataPath = processDataPath(dataPath, treeData, groupAllowUnbalanced);
        addValue(this.createKey(processedDataPath as any), processedDataPath as any);
    }
}
