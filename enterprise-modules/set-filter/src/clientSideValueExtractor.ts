import { IClientSideRowModel, ISetFilterParams, KeyCreatorParams, RowNode, _ } from '@ag-grid-community/core';

const NULL_SUBSTITUTE = '__<ag-grid-pseudo-null>__';
export class ClientSideValuesExtractor {
    private readonly caseSensitive: boolean;

    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly filterParams: ISetFilterParams,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
    ) {
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean): (string | null)[] {
        const values: {[key: string]: string | null} = {};
        const { keyCreator } = this.filterParams.colDef;

        const addValue = (value: string | null) => {
            // NOTE: We don't care about the keys later on (only values in the dictionary are
            // returned), so as long as we use a non-conflicting key for the `null` value this
            // will behave correctly.
            const valueKey = value != null ? this.caseFormat(value) : NULL_SUBSTITUTE;

            if (valueKey && values[valueKey] == null) {
                values[valueKey] = value;
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