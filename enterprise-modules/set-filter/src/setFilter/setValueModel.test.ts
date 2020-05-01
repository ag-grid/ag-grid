import { SetValueModel } from './setValueModel';
import { Constants, ColDef, RowNode, IClientSideRowModel } from '@ag-grid-community/core';

function createSetValueModel(values: any[] = ['A', 'B', 'C']) {
    const colDef = {} as ColDef;
    const rowModel = {
        getType: () => Constants.ROW_MODEL_TYPE_CLIENT_SIDE,
        forEachLeafNode: (callback: (node: RowNode) => void) => {
            const nodes = values.map(v => ({ data: v }));
            nodes.forEach(callback);
        }
    } as IClientSideRowModel;

    return new SetValueModel(
        colDef,
        rowModel,
        node => node.data,
        _ => true,
        false,
        _ => { },
        null,
        null);
}

describe('isFilterActive', () => {
    it('returns false by default', () => {
        const model = createSetValueModel();

        expect(model.isFilterActive()).toBe(false);
    });

    it('returns true if any value is deselected', () => {
        const model = createSetValueModel();

        model.deselectValue('B');

        expect(model.isFilterActive()).toBe(true);
    });

    it('returns true if all values are deselected', () => {
        const model = createSetValueModel();

        model.selectNothing();

        expect(model.isFilterActive()).toBe(true);
    });


    it('returns false if value is deselected then selected again', () => {
        const model = createSetValueModel();
        const value = 'B';

        model.deselectValue(value);
        model.selectValue(value);

        expect(model.isFilterActive()).toBe(false);
    });
});

describe('value selection', () => {
    it('has all values selected by default', () => {
        const model = createSetValueModel();

        expect(model.isEverythingSelected()).toBe(true);
    });

    it('can change value selection', () => {
        const model = createSetValueModel();
        const value = 'A';

        expect(model.isValueSelected(value)).toBe(true);

        model.deselectValue(value);

        expect(model.isValueSelected(value)).toBe(false);

        model.selectValue(value);

        expect(model.isValueSelected(value)).toBe(true);
    });
});