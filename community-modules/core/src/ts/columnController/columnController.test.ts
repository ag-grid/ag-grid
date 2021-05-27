import { ColumnModel } from './columnModel';

function createModel(gridOptionsWrapper: any): ColumnModel {
    const columnModel = new ColumnModel();

    (columnModel as any).gridOptionsWrapper = gridOptionsWrapper;

    return columnModel;
}

describe('hasFloatingFilters', () => {
    it('returns false by default', () => {
        const controller = createModel({
            getDefaultColDef: () => { }
        });

        expect(controller.hasFloatingFilters()).toBe(false);
    });
});
