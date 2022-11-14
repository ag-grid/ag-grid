import { IClientSideRowModel, ISetFilterParams, RowNode, _ } from '@ag-grid-community/core';

/** @param V type of value in the Set Filter */
export class ClientSideValuesExtractor<V> {
    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly filterParams: ISetFilterParams<any, V>,
        private readonly getKey: (value: V | null, node?: RowNode) => string | null,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat
    ) {
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean, existingValues?: Map<string | null, V | null>): Map<string | null, V | null> {
        const values: Map<string | null, V | null> = new Map();

        const addValue = (unformattedKey: string | null, value: V | null) => {
            const key = this.caseFormat(unformattedKey);
            if (!values.has(key)) {
                let valueToAdd = _.makeNull(value);
                if (existingValues) {
                    // when case insensitive, we pick the first value to use. if this is later filtered out,
                    // we still want to use the original value and not one with a different case
                    const uniqueValue = existingValues.get(key);
                    if (uniqueValue != null) {
                        valueToAdd = uniqueValue;
                    }
                }
                values.set(key, valueToAdd);
            }
        };

        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) { return; }

            const {api, colDef, column, columnApi, context} = this.filterParams;
            let value: V | null = this.filterParams.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });

            if (this.filterParams.suppressComplexObjects) {
                // for backwards compatibility - keeping separate as it will eventually be removed
                const key = this.getKey(value, node);
                if (key != null && Array.isArray(key)) {
                    key.forEach(x => {
                        addValue(x, x);
                    });
                } else {
                    addValue(key, key as any);
                }
            } else {
                if (value != null && Array.isArray(value)) {
                    value.forEach(x => {
                        addValue(this.getKey(x, node), x);
                    });
                } else {
                    addValue(this.getKey(value, node), value);
                }
            }
        });

        return values;
    }
}