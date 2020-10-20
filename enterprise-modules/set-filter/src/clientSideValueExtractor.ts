import { IClientSideRowModel, RowNode, ColDef, _ } from '@ag-grid-community/core';

export class ClientSideValuesExtractor {
    constructor(
        private readonly rowModel: IClientSideRowModel,
        private readonly colDef: ColDef,
        private readonly valueGetter: (node: RowNode) => string) {
    }

    public extractUniqueValues(predicate: (node: RowNode) => boolean): (string | null)[] {
        const values = new Set<string | null>();
        const { keyCreator } = this.colDef;

        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) { return; }

            let value: string | null = this.valueGetter(node);

            if (keyCreator) {
                value = keyCreator({ value });
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