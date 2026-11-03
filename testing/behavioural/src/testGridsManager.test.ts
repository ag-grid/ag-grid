import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';

import type { ICellRendererComp } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';

/** Fails while the grid UI is torn down, before the grid's services are. */
class FailingDestroyRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('span');
    public init(): void {}
    public getGui(): HTMLElement {
        return this.eGui;
    }
    public refresh(): boolean {
        return false;
    }
    public destroy(): void {
        throw new Error('destroy failed');
    }
}

describe('TestGridsManager', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('a grid whose destroy throws is released, the other grids are destroyed, and its id can be reused', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [307, 310] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        // An unknown grid option is reported once per page: reset must start a new page whatever destroy does.
        const unknownOption: string = 'notARealOption';
        const createGridWithUnknownOption = () =>
            gridsManager.createGrid('grid3', { columnDefs: [{ field: 'a' }], ...{ [unknownOption]: true } });
        const rowData = [{ a: 1 }];
        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'a', cellRenderer: FailingDestroyRenderer }],
            rowData,
        });
        const other = await gridsManager.createGridAndWait('grid2', { columnDefs: [{ field: 'a' }], rowData });
        createGridWithUnknownOption();

        let thrown: unknown;
        try {
            gridsManager.reset();
        } catch (error) {
            thrown = error;
        }
        expect({
            thrown: String(thrown),
            grids: gridsManager.getAllGrids().length,
            otherDestroyed: other.isDestroyed(),
        }).toEqual({ thrown: 'Error: destroy failed', grids: 0, otherDestroyed: true });

        const again = gridsManager.createGrid('grid1', { columnDefs: [{ field: 'a' }], rowData });
        const reported = createGridWithUnknownOption();
        expect({
            grids: gridsManager.getAllGrids(),
            unknownOptionReports: warnSpy.mock.calls.filter((args) => String(args[0]).includes('#307')).length,
        }).toEqual({ grids: [again, reported], unknownOptionReports: 2 });
    });
});
