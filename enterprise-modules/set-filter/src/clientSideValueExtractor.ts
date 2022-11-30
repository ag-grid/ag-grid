import { ColumnModel, GetDataPath, IClientSideRowModel, ISetFilterParams, RowNode, ValueService, _ } from '@ag-grid-community/core';

/** @param V type of value in the Set Filter */
export class ClientSideValuesExtractor<V> {
    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly filterParams: ISetFilterParams<any, V>,
        private readonly createKey: (value: V | null, node?: RowNode) => string | null,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
        private readonly columnModel: ColumnModel,
        private readonly valueService: ValueService,
        private readonly treeData: boolean,
        private readonly getDataPath?: GetDataPath
    ) {
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean, existingValues?: Map<string | null, V | null>): Map<string | null, V | null> {
        const values: Map<string | null, V | null> = new Map();
        const existingFormattedKeys = this.extractExistingFormattedKeys(existingValues);
        const formattedKeys: Set<string | null> = new Set();

        const addValue = (unformattedKey: string | null, value: V | null) => {
            const formattedKey = this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                let keyToAdd = unformattedKey;
                let valueToAdd = _.makeNull(value);
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

        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) { return; }

            let value = this.getValue(node);

            if (this.filterParams.convertValuesToStrings) {
                // for backwards compatibility - keeping separate as it will eventually be removed
                const key = this.createKey(value, node);
                if (key != null && Array.isArray(key)) {
                    key.forEach(part => {
                        const processedPart = _.toStringOrNull(_.makeNull(part));
                        addValue(processedPart, processedPart as any);
                    });
                } else {
                    addValue(key, key as any);
                }
            } else {
                if (value != null && Array.isArray(value)) {
                    value.forEach(x => {
                        addValue(this.createKey(x, node), x);
                    });
                } else {
                    addValue(this.createKey(value, node), value);
                }
            }
        });

        return values;
    }

    public extractTreeValues(predicate: (node: RowNode) => boolean): (string[] | null)[] {
        const values: (string[] | null)[] = [];
        const treeData = this.treeData && !!this.getDataPath;
        const groupedCols = this.columnModel.getRowGroupColumns()

        this.rowModel.forEachLeafNode(node => {
            // only extract leaves. The core filtering logic for tree data won't work properly otherwise
            if (node.childrenAfterGroup?.length || !predicate(node)) { return; }

            if (treeData) {
                values.push(this.getDataPath!(node.data) as any);
            } else {
                const dataPath = groupedCols.map(groupCol => this.valueService.getKeyForNode(groupCol, node));
                dataPath.push(_.toStringOrNull(_.makeNull(this.getValue(node))));
                values.push(dataPath);
            }
        });

        return values;
    }

    private getValue(node: RowNode): V | null {
        const {api, colDef, column, columnApi, context} = this.filterParams;
        return this.filterParams.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        });
    }

    private extractExistingFormattedKeys(existingValues?: Map<string | null, V | null>): Map<string | null, string | null> | null {
        if (!existingValues) {
            return null;
        }
        const existingFormattedKeys: Map<string | null, string | null> = new Map();
        existingValues.forEach((_value, key) => {
            existingFormattedKeys.set(this.caseFormat(key), key);
        });
        return existingFormattedKeys;
    }
}