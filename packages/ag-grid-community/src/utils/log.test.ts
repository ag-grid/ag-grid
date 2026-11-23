import { _errorOnce, _warnOnce } from './log';

describe('_warnOnce and _errorOnce', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('log an arg that has no string form instead of throwing', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const value = Object.create(null);

        expect(() => _warnOnce('no string form', value)).not.toThrow();
        expect(() => _errorOnce('no string form', value)).not.toThrow();

        expect(warn).toHaveBeenCalledWith('AG Grid: no string form', value);
        expect(error).toHaveBeenCalledWith('AG Grid: no string form', value);
    });

    test('log a repeated message only once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        _warnOnce('repeated message', 'arg');
        _warnOnce('repeated message', 'arg');

        expect(warn).toHaveBeenCalledTimes(1);
    });
});
