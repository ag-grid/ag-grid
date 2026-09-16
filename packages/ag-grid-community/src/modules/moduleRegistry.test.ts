import type { CapturedDiagnostic } from '../validation/logging';

// Registration is process-global, so each case needs a fresh module graph to register a fake module into.
async function loadRegistry() {
    vi.resetModules();
    const logModule = await import('../utils/log');
    const errorOnce = vi.spyOn(logModule, '_errorOnce').mockImplementation(() => undefined);
    const [{ _registerModule }, { _addDiagnosticListener }, { _enableDiagnosticCapture }] = await Promise.all([
        import('./moduleRegistry'),
        import('../validation/logging'),
        import('../validation/validationConfig'),
    ]);

    _enableDiagnosticCapture();
    const received: CapturedDiagnostic[] = [];
    const off = _addDiagnosticListener(undefined, (diagnostic) => received.push(diagnostic));

    return { _registerModule, errorOnce, received, off };
}

describe('module validation failures', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('an errorId result is captured as a diagnostic as well as logged', async () => {
        const { _registerModule, received, off } = await loadRegistry();

        _registerModule(
            {
                moduleName: 'IntegratedCharts',
                version: '1.0.0',
                validate: () => ({ isValid: false, errorId: 257 }),
            },
            undefined
        );
        off();

        expect(received.map(({ id, severity }) => ({ id, severity }))).toEqual([{ id: 257, severity: 'error' }]);
    });

    test('a free-text message result is logged without being captured', async () => {
        const { _registerModule, errorOnce, received, off } = await loadRegistry();

        _registerModule(
            {
                moduleName: 'IntegratedCharts',
                version: '1.0.0',
                validate: () => ({ isValid: false, message: 'no charts for you' }),
            },
            undefined
        );
        off();

        expect(received).toEqual([]);
        expect(errorOnce).toHaveBeenCalledWith('no charts for you');
    });
});
