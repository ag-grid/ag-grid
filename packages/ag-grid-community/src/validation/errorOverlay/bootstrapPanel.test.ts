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
        _applyDevValidationConfig({ overlay: 'deprecation' });
        const container = document.createElement('div');

        renderBootstrapPanel(container, [errorDiagnostic]);

        const panel = container.querySelector('.ag-overlay-error-bootstrap-panel');
        expect(panel).not.toBeNull();
        expect(panel!.textContent).toContain('AG Grid failed to initialise');
        expect(panel!.querySelector('a.ag-overlay-error-link')?.getAttribute('href')).toContain('/errors/200');
        expect(panel!.querySelector('button')?.textContent).toBe('Copy');
    });

    test('renders nothing when the overlay is disabled', () => {
        _applyDevValidationConfig({ overlay: 'none' });
        const container = document.createElement('div');

        renderBootstrapPanel(container, [errorDiagnostic]);

        expect(container.childElementCount).toBe(0);
    });

    test("renders only errors when the overlay mode is 'error'", () => {
        _applyDevValidationConfig({ overlay: 'error' });
        const container = document.createElement('div');
        const warning: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };

        renderBootstrapPanel(container, [errorDiagnostic, warning]);

        expect(container.querySelectorAll('.ag-overlay-error-item')).toHaveLength(1);
    });

    test("renders errors and warnings but not deprecations when the overlay mode is 'warning'", () => {
        _applyDevValidationConfig({ overlay: 'warning' });
        const container = document.createElement('div');
        const warning: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };
        const deprecation: CapturedDiagnostic = { id: 23, params: { key: 'rowData' }, severity: 'deprecation' };

        renderBootstrapPanel(container, [errorDiagnostic, warning, deprecation]);

        expect(container.querySelectorAll('.ag-overlay-error-item')).toHaveLength(2);
    });

    test('groups diagnostics into titled sections divided by an <hr>', () => {
        _applyDevValidationConfig({ overlay: 'warning' });
        const container = document.createElement('div');
        const warning: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };

        renderBootstrapPanel(container, [errorDiagnostic, warning]);

        const headers = Array.from(container.querySelectorAll('.ag-overlay-error-section-header')).map(
            (h) => h.textContent
        );
        expect(headers).toEqual(['Errors (1)', 'Warnings (1)']);
        expect(container.querySelectorAll('hr.ag-overlay-error-divider')).toHaveLength(1);
    });

    test('shows no divider within a single-severity section', () => {
        _applyDevValidationConfig({ overlay: 'deprecation' });
        const container = document.createElement('div');
        const secondError: CapturedDiagnostic = {
            id: 200,
            params: { moduleName: 'ServerSideRowModel', rowModelType: 'serverSide' },
            severity: 'error',
        };

        renderBootstrapPanel(container, [errorDiagnostic, secondError]);

        expect(container.querySelectorAll('.ag-overlay-error-section-header')[0]?.textContent).toBe('Errors (2)');
        expect(container.querySelectorAll('hr')).toHaveLength(0);
    });

    test('renders a single panel when called repeatedly on the same container', () => {
        _applyDevValidationConfig({ overlay: 'deprecation' });
        const container = document.createElement('div');

        // A re-created grid (e.g. React StrictMode) renders into the same container more than once.
        renderBootstrapPanel(container, [errorDiagnostic]);
        renderBootstrapPanel(container, [errorDiagnostic, errorDiagnostic]);

        expect(container.querySelectorAll('.ag-overlay-error-bootstrap-panel')).toHaveLength(1);
    });

    test('removes a stale panel when the overlay is disabled before a re-render', () => {
        _applyDevValidationConfig({ overlay: 'deprecation' });
        const container = document.createElement('div');
        renderBootstrapPanel(container, [errorDiagnostic]);

        // Overlay config is global and last-write-wins, so it can be turned off between grid re-creations.
        _applyDevValidationConfig({ overlay: 'none' });
        renderBootstrapPanel(container, [errorDiagnostic]);

        expect(container.childElementCount).toBe(0);
    });

    test('dedupes identical diagnostics within a single render', () => {
        _applyDevValidationConfig({ overlay: 'deprecation' });
        const container = document.createElement('div');

        renderBootstrapPanel(container, [errorDiagnostic, errorDiagnostic]);

        expect(container.querySelectorAll('.ag-overlay-error-item')).toHaveLength(1);
    });
});
