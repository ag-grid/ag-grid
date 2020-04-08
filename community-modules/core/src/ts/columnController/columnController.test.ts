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

    it('returns true if floating filters are enabled on columns by default', () => {
        const controller = createController({
            getDefaultColDef: () => ({ floatingFilter: true })
        });

        expect(controller.hasFloatingFilters()).toBe(true);
    });

    it('returns true if floating filters are enabled on any colDef', () => {
        const controller = createController({
            getDefaultColDef: () => { }
        });

        (controller as any).columnDefs = [{ floatingFilter: false }, { floatingFilter: true }];

        expect(controller.hasFloatingFilters()).toBe(true);
    });
});
