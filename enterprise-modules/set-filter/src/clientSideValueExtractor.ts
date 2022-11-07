import { IClientSideRowModel, ISetFilterParams, KeyCreatorParams, RowNode, _ } from '@ag-grid-community/core';

export class ClientSideValuesExtractor {
    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly filterParams: ISetFilterParams,
        private readonly uniqueKey: (v: string | null) => string,
    ) {
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean, uniqueValues?: { [key: string]: string | null }): (string | null)[] {
        const values: {[key: string]: string | null} = {};
        const { keyCreator } = this.filterParams.colDef;

        const addValue = (value: string | null) => {
            const valueKey = this.uniqueKey(value);

            if (valueKey && values[valueKey] == null) {
                let valueToAdd = value;
                if (uniqueValues) {
                    // when case insensitive, we pick the first value to use. if this is later filtered out,
                    // we still want to use the original value and not one with a different case
                    const uniqueValue = uniqueValues[valueKey];
                    if (uniqueValue != null) {
                        valueToAdd = uniqueValue;
                    }
                }
                values[valueKey] = valueToAdd;
            }
        };

        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) { return; }

            const {api, colDef, column, columnApi, context} = this.filterParams;
            let value: string | null = this.filterParams.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });
    
            if (keyCreator) {
                const params: KeyCreatorParams = {
                    value: value,
                    colDef: this.filterParams.colDef,
                    column: this.filterParams.column,
                    node: node,
                    data: node.data,
                    api: this.filterParams.api,
                    columnApi: this.filterParams.columnApi,
                    context: this.filterParams.context
                };
                value = keyCreator(params);
            }

            value = _.makeNull(value);

            if (value != null && Array.isArray(value)) {
                value.forEach(x => {
                    const formatted = _.toStringOrNull(_.makeNull(x));
                    addValue(formatted);
                });
            } else {
                addValue(_.toStringOrNull(value));
            }
        });

        return _.values(values);
    }
}