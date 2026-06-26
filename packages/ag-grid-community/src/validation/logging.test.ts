import { _errorOnce, _warnOnce } from '../utils/log';
import type { OverlayError } from './logging';
import {
    _addErrorListener,
    _configureDiagnostics,
    _deprecated,
    _error,
    _logPreInitErr,
    _logPreInitWarn,
    _warn,
} from './logging';

vi.mock('../utils/log', () => ({
    _warnOnce: vi.fn(),
    _errorOnce: vi.fn(),
}));

const mockWarnOnce = vi.mocked(_warnOnce);
const mockErrorOnce = vi.mocked(_errorOnce);

/** Resets the module-level diagnostic state between tests (flags off, buffer drained). */
function resetDiagnostics(): void {
    _configureDiagnostics({ capture: false, throwOn: false });
    // Attaching then detaching the only listener drops the buffer (cleared on last detach).
    _addErrorListener(() => undefined)();
}

beforeEach(() => {
    vi.clearAllMocks();
    resetDiagnostics();
});

describe('diagnostic capture', () => {
    test('does not buffer or notify listeners when capture is disabled', () => {
        const listener = vi.fn();
        const off = _addErrorListener(listener);

        _error(11);
        _warn(11);

        expect(listener).not.toHaveBeenCalled();
        // Logging still happens regardless of capture.
        expect(mockErrorOnce).toHaveBeenCalledTimes(1);
        expect(mockWarnOnce).toHaveBeenCalledTimes(1);
        off();
    });

    test('notifies listeners of errors and warnings with the correct severity', () => {
        _configureDiagnostics({ capture: true });
        const received: OverlayError[] = [];
        const off = _addErrorListener((e) => received.push(e));

        _error(11);
        _warn(11);
        _deprecated(11);

        expect(received).toHaveLength(3);
        expect(received[0].severity).toBe('error');
        expect(received[1].severity).toBe('warning');
        expect(received[2].severity).toBe('deprecation');
        expect(received[0].id).toBe(11);
        off();
    });

    test('replays buffered diagnostics to a listener that attaches later', () => {
        _configureDiagnostics({ capture: true });
        _error(11);
        _warn(11);

        const received: OverlayError[] = [];
        const off = _addErrorListener((e) => received.push(e));

        expect(received.map((e) => e.severity)).toEqual(['error', 'warning']);
        off();
    });

    test('drops the buffer only once the last listener detaches', () => {
        _configureDiagnostics({ capture: true });
        const off1 = _addErrorListener(() => undefined);
        const off2 = _addErrorListener(() => undefined);
        _error(11);

        // First detach leaves a listener, so the buffer survives for a newcomer.
        off1();
        const afterFirstDetach: OverlayError[] = [];
        const off3 = _addErrorListener((e) => afterFirstDetach.push(e));
        expect(afterFirstDetach).toHaveLength(1);

        // Once every listener has gone the buffer is cleared.
        off2();
        off3();
        const afterAllDetached: OverlayError[] = [];
        const off4 = _addErrorListener((e) => afterAllDetached.push(e));
        expect(afterAllDetached).toHaveLength(0);
        off4();
    });

    test('caps the buffer to bound memory', () => {
        _configureDiagnostics({ capture: true });
        for (let i = 0; i < 105; i++) {
            _error(11);
        }

        const received: OverlayError[] = [];
        const off = _addErrorListener((e) => received.push(e));
        expect(received).toHaveLength(100);
        off();
    });
});

describe('throw mode', () => {
    test("throwOn 'error' throws on errors but not warnings", () => {
        _configureDiagnostics({ throwOn: 'error' });

        expect(() => _error(11)).toThrow();
        expect(() => _warn(11)).not.toThrow();
        expect(() => _logPreInitErr(11, undefined as any, 'boom')).toThrow();
        expect(() => _logPreInitWarn(11, undefined as any, 'boom')).not.toThrow();
    });

    test("throwOn 'warning' throws on errors and warnings but not deprecations", () => {
        _configureDiagnostics({ throwOn: 'warning' });

        expect(() => _error(11)).toThrow();
        expect(() => _warn(11)).toThrow();
        expect(() => _logPreInitWarn(11, undefined as any, 'boom')).toThrow();
        expect(() => _deprecated(11)).not.toThrow();
    });

    test("throwOn 'deprecation' throws on deprecations, warnings and errors", () => {
        _configureDiagnostics({ throwOn: 'deprecation' });

        expect(() => _deprecated(11)).toThrow();
        expect(() => _warn(11)).toThrow();
        expect(() => _error(11)).toThrow();
    });

    test('logs to the console before throwing', () => {
        _configureDiagnostics({ throwOn: 'error' });

        expect(() => _error(11)).toThrow();
        expect(mockErrorOnce).toHaveBeenCalledTimes(1);
    });

    test('includes the default message in the thrown error', () => {
        _configureDiagnostics({ throwOn: 'error' });

        expect(() => _logPreInitErr(11, undefined as any, 'Custom boom')).toThrow(/Custom boom/);
    });

    test('does not throw when no threshold is configured', () => {
        expect(() => _error(11)).not.toThrow();
        expect(() => _warn(11)).not.toThrow();
    });
});
