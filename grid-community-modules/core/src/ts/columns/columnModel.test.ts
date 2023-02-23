import { ColumnModel } from './columnModel';

function createModel(gridOptionsService: any): ColumnModel {
    const columnModel = new ColumnModel();

    (columnModel as any).gridOptionsService = gridOptionsService;

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
