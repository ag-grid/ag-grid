import { IClientSideRowModel, IFilterParams, KeyCreatorParams, RowNode, _ } from '@ag-grid-community/core';

export class ClientSideValuesExtractor {
    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly filterParams: IFilterParams) {
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean): (string | null)[] {
        const values = new Set<string | null>();
        const { keyCreator } = this.filterParams.colDef;

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
                    values.add(formatted);
                });
            } else {
                values.add(_.toStringOrNull(value));
            }
        });

        return _.values(values);
    }
}