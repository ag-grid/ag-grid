import { ValidationModule, createGrid } from 'ag-grid-community';

// When grid creation aborts before any bean exists (e.g. the row-model module is missing), there is no
// grid and so no overlay. The ValidationModule instead renders a standalone, inline-styled panel into the
// grid root so the failure is still surfaced. The serverSide row model module is not registered here
// (it is enterprise-only), so requesting it aborts creation with the missing-module error #200.
describe('dev validation bootstrap panel', () => {
    beforeEach(() => {
        vitest.spyOn(console, 'error').mockImplementation(() => {});
        document.body.innerHTML = '<div id="grid"></div>';
    });

    afterEach(() => {
        vitest.restoreAllMocks();
    });

    test('renders a standalone panel into the grid root when creation aborts', () => {
        const eDiv = document.getElementById('grid')!;

        const api = createGrid(
            eDiv,
            { columnDefs: [{ field: 'a' }], rowModelType: 'serverSide' },
            { modules: [ValidationModule] }
        );

        // Creation aborted (no row-model module), so no grid api is returned.
        expect(api).toBeUndefined();

        const panel = eDiv.querySelector('.ag-overlay-error-bootstrap-panel');
        expect(panel).not.toBeNull();
        expect(panel!.textContent).toContain('AG Grid failed to initialise');

        const link = panel!.querySelector<HTMLAnchorElement>('a.ag-overlay-error-link');
        expect(link?.href).toContain('/errors/200');
    });
});
