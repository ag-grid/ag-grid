import { ColumnController } from './columnController';

function createController(gridOptionsWrapper: any): ColumnController {
    const columnController = new ColumnController();

    (columnController as any).gridOptionsWrapper = gridOptionsWrapper;

    return columnController;
}

describe('hasFloatingFilters', () => {
    it('returns false by default', () => {
        const controller = createController({
            getDefaultColDef: () => { }
        });

        expect(controller.hasFloatingFilters()).toBe(false);
    });
});
