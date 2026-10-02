// Debug logging state is module-global, so each test starts from a fresh module graph.
describe('dev validation debug config', () => {
    const loadModules = async () => {
        vi.resetModules();
        const [{ _applyDevValidationConfig, _enableDiagnosticCapture }, { _isDebugLoggingEnabled }] = await Promise.all(
            [import('./validationConfig'), import('../utils/log')]
        );
        return { _applyDevValidationConfig, _enableDiagnosticCapture, _isDebugLoggingEnabled };
    };

    test('debug logging is off by default and on for the deprecated grid option', async () => {
        const { _isDebugLoggingEnabled } = await loadModules();

        expect(_isDebugLoggingEnabled(undefined)).toBe(false);
        expect(_isDebugLoggingEnabled(true)).toBe(true);
    });

    test('debug: true enables debug logging, and a later call without it turns it off', async () => {
        const { _applyDevValidationConfig, _isDebugLoggingEnabled } = await loadModules();

        _applyDevValidationConfig({ debug: true });
        expect(_isDebugLoggingEnabled(undefined)).toBe(true);

        _applyDevValidationConfig();
        expect(_isDebugLoggingEnabled(undefined)).toBe(false);
    });

    test('enabling capture alone does not reset debug logging', async () => {
        const { _applyDevValidationConfig, _enableDiagnosticCapture, _isDebugLoggingEnabled } = await loadModules();

        _applyDevValidationConfig({ debug: true });
        _enableDiagnosticCapture();
        expect(_isDebugLoggingEnabled(undefined)).toBe(true);
    });
});
