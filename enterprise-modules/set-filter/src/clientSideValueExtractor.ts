import { IClientSideRowModel, ISetFilterParams, KeyCreatorParams, RowNode, _ } from '@ag-grid-community/core';

export class ClientSideValuesExtractor {
    private readonly caseSensitive: boolean;

    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly filterParams: ISetFilterParams
    ) {
        this.caseSensitive = this.filterParams.caseSensitive || false;
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean): (string | null)[] {
        const values: {[key: string]: string | null} = {};
        const { keyCreator } = this.filterParams.colDef;

        const addValue = (value: string | null) => {
            const valueKey = !this.caseSensitive && value ? value.toUpperCase() : value;
            if (valueKey && values[valueKey] == null) {
                values[valueKey] = value;
            }
        };

        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) { return; }

            let value: string | null = this.filterParams.valueGetter(node);

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
                _.forEach(value, x => {
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