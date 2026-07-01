import type { CapturedDiagnostic } from '../logging';
import { _applyDevValidationConfig } from '../validationConfig';
import { renderBootstrapPanel } from './bootstrapPanel';

const errorDiagnostic: CapturedDiagnostic = {
    id: 200,
    params: { moduleName: 'ClientSideRowModel', rowModelType: 'clientSide' },
    severity: 'error',
};

describe('renderBootstrapPanel', () => {
    test('renders a panel with the diagnostic, an error link and a Copy control', () => {
        _applyDevValidationConfig({ overlay: 'all' });
        const container = document.createElement('div');

        renderBootstrapPanel(container, [errorDiagnostic]);

        const panel = container.querySelector('.ag-overlay-error-bootstrap-panel');
        expect(panel).not.toBeNull();
        expect(panel!.textContent).toContain('AG Grid failed to initialise');
        expect(panel!.querySelector('a.ag-overlay-error-link')?.getAttribute('href')).toContain('/errors/200');
        expect(panel!.querySelector('button')?.textContent).toBe('Copy');
    });

    test('renders nothing when the overlay is disabled', () => {
        _applyDevValidationConfig({ overlay: false });
        const container = document.createElement('div');

        renderBootstrapPanel(container, [errorDiagnostic]);

        expect(container.childElementCount).toBe(0);
    });

    test("renders only errors when the overlay mode is 'errors'", () => {
        _applyDevValidationConfig({ overlay: 'errors' });
        const container = document.createElement('div');
        const warning: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };

        renderBootstrapPanel(container, [errorDiagnostic, warning]);

        expect(container.querySelectorAll('.ag-overlay-error-item')).toHaveLength(1);
    });

    test('renders a single panel when called repeatedly on the same container', () => {
        _applyDevValidationConfig({ overlay: 'all' });
        const container = document.createElement('div');

        // A re-created grid (e.g. React StrictMode) renders into the same container more than once.
        renderBootstrapPanel(container, [errorDiagnostic]);
        renderBootstrapPanel(container, [errorDiagnostic, errorDiagnostic]);

        expect(container.querySelectorAll('.ag-overlay-error-bootstrap-panel')).toHaveLength(1);
    });

    test('removes a stale panel when the overlay is disabled before a re-render', () => {
        _applyDevValidationConfig({ overlay: 'all' });
        const container = document.createElement('div');
        renderBootstrapPanel(container, [errorDiagnostic]);

        // Overlay config is global and last-write-wins, so it can be turned off between grid re-creations.
        _applyDevValidationConfig({ overlay: false });
        renderBootstrapPanel(container, [errorDiagnostic]);

        expect(container.childElementCount).toBe(0);
    });

    test('dedupes identical diagnostics within a single render', () => {
        _applyDevValidationConfig({ overlay: 'all' });
        const container = document.createElement('div');

        renderBootstrapPanel(container, [errorDiagnostic, errorDiagnostic]);

        expect(container.querySelectorAll('.ag-overlay-error-item')).toHaveLength(1);
    });
});
