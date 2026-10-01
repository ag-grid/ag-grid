import type { CapturedDiagnostic } from '../validation/logging';

// Registration is process-global, so each case needs a fresh module graph to register a fake module into.
async function loadRegistry({ captureFromTheStart = true } = {}) {
    vi.resetModules();
    const logModule = await import('../utils/log');
    const errorOnce = vi.spyOn(logModule, '_errorOnce').mockImplementation(() => undefined);
    const [{ _registerModule }, { _addDiagnosticListener }, { _enableDiagnosticCapture }] = await Promise.all([
        import('./moduleRegistry'),
        import('../validation/logging'),
        import('../validation/validationConfig'),
    ]);

    if (captureFromTheStart) {
        _enableDiagnosticCapture();
    }
    const cleanups: (() => void)[] = [];
    const listen = (gridId: string | undefined) => {
        const received: CapturedDiagnostic[] = [];
        cleanups.push(_addDiagnosticListener(gridId, (diagnostic) => received.push(diagnostic)));
        return received;
    };

    return {
        _registerModule,
        errorOnce,
        listen,
        _enableDiagnosticCapture,
        detachAll: () => cleanups.forEach((off) => off()),
    };
}

const failingCharts = {
    moduleName: 'IntegratedCharts' as const,
    version: '1.0.0',
    validate: () => ({ isValid: false as const, errorId: 257 as const }),
};

describe('module validation failures', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('an errorId result is captured as a diagnostic as well as logged', async () => {
        const { _registerModule, listen, detachAll } = await loadRegistry();
        const received = listen(undefined);

        _registerModule(failingCharts, undefined);
        detachAll();

        expect(received.map(({ id, severity }) => ({ id, severity }))).toEqual([{ id: 257, severity: 'error' }]);
    });

    test('a grid-scoped failure reaches only its own grid', async () => {
        const { _registerModule, listen, detachAll } = await loadRegistry();
        const ownGrid = listen('grid-2');
        const otherGrid = listen('grid-1');

        _registerModule(failingCharts, 'grid-2');
        detachAll();

        expect(ownGrid.map(({ id, gridId }) => ({ id, gridId }))).toEqual([{ id: 257, gridId: 'grid-2' }]);
        expect(otherGrid).toEqual([]);
    });

    test('a global registration failure is untied, so every grid sees it', async () => {
        const { _registerModule, listen, detachAll } = await loadRegistry();
        const gridOne = listen('grid-1');

        _registerModule(failingCharts, undefined);
        detachAll();

        expect(gridOne.map(({ id, gridId }) => ({ id, gridId }))).toEqual([{ id: 257, gridId: undefined }]);
    });

    test('a free-text message result is logged without being captured', async () => {
        const { _registerModule, errorOnce, listen, detachAll } = await loadRegistry();
        const received = listen(undefined);

        _registerModule(
            {
                moduleName: 'IntegratedCharts',
                version: '1.0.0',
                validate: () => ({ isValid: false, message: 'no charts for you' }),
            },
            undefined
        );
        detachAll();

        expect(received).toEqual([]);
        expect(errorOnce).toHaveBeenCalledWith('no charts for you');
    });

    // registerModules([IntegratedChartsModule, ValidationModule]) validates the charts module before the
    // ValidationModule has turned capture on, so the failure has to survive until it does.
    test('a failure raised before capture is enabled is replayed once it is', async () => {
        const { _registerModule, listen, _enableDiagnosticCapture, detachAll } = await loadRegistry({
            captureFromTheStart: false,
        });

        _registerModule(failingCharts, undefined);
        const received = listen(undefined);
        _enableDiagnosticCapture();
        detachAll();

        expect(received.map(({ id, severity }) => ({ id, severity }))).toEqual([{ id: 257, severity: 'error' }]);
    });
});
