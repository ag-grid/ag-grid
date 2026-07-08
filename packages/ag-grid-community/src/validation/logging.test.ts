import { _errorOnce, _warnOnce } from '../utils/log';
import type { CapturedDiagnostic } from './logging';
import {
    _addDiagnosticListener,
    _configureDiagnostics,
    _deprecated,
    _deprecatedG,
    _error,
    _errorG,
    _logPreInitErr,
    _logPreInitWarn,
    _provideBootstrapPanelRenderer,
    _renderBootstrapPanel,
    _runWithActiveGrid,
    _warn,
    _warnG,
    getErrorLink,
} from './logging';
import { _applyDevValidationConfig, _enableDiagnosticCapture } from './validationConfig';

vi.mock('../utils/log', () => ({
    _warnOnce: vi.fn(),
    _errorOnce: vi.fn(),
}));

const mockWarnOnce = vi.mocked(_warnOnce);
const mockErrorOnce = vi.mocked(_errorOnce);

// Attaches a page-level listener (no grid id) that receives every captured diagnostic
function listenAll(listener: (diagnostic: CapturedDiagnostic) => void): () => void {
    return _addDiagnosticListener(undefined, listener);
}

function resetDiagnostics(): void {
    _configureDiagnostics({ capture: false, throwOn: false, suppress: [] });
    // Attaching then detaching the only listener drops the buffer (cleared on last detach)
    listenAll(() => undefined)();
}

beforeEach(() => {
    vi.clearAllMocks();
    resetDiagnostics();
});

describe('diagnostic capture', () => {
    test('does not buffer or notify listeners when capture is disabled', () => {
        const listener = vi.fn();
        const off = listenAll(listener);

        _error(11);
        _warn(11);

        expect(listener).not.toHaveBeenCalled();
        // Logging still happens regardless of capture
        expect(mockErrorOnce).toHaveBeenCalledTimes(1);
        expect(mockWarnOnce).toHaveBeenCalledTimes(1);
        off();
    });

    test('notifies listeners of errors and warnings with the correct severity', () => {
        _configureDiagnostics({ capture: true });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _error(11);
        _warn(11);
        _deprecated(11);

        expect(received.map((e) => ({ id: e.id, severity: e.severity }))).toEqual([
            { id: 11, severity: 'error' },
            { id: 11, severity: 'warning' },
            { id: 11, severity: 'deprecation' },
        ]);
        off();
    });

    test('replays buffered diagnostics to a listener that attaches later', () => {
        _configureDiagnostics({ capture: true });
        _error(11);
        _warn(11);

        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        expect(received.map((e) => e.severity)).toEqual(['error', 'warning']);
        off();
    });

    test('drops the buffer only once the last listener detaches', () => {
        _configureDiagnostics({ capture: true });
        const off1 = listenAll(() => undefined);
        const off2 = listenAll(() => undefined);
        _error(11);

        // First detach leaves a listener, so the buffer survives for a newcomer
        off1();
        const afterFirstDetach: CapturedDiagnostic[] = [];
        const off3 = listenAll((e) => afterFirstDetach.push(e));
        expect(afterFirstDetach).toHaveLength(1);

        // Once every listener has gone the buffer is cleared
        off2();
        off3();
        const afterAllDetached: CapturedDiagnostic[] = [];
        const off4 = listenAll((e) => afterAllDetached.push(e));
        expect(afterAllDetached).toHaveLength(0);
        off4();
    });

    test('caps the buffer to bound memory', () => {
        _configureDiagnostics({ capture: true });
        for (let i = 0; i < 105; i++) {
            _error(11);
        }

        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));
        expect(received).toHaveLength(100);
        off();
    });
});

describe('grid scoping', () => {
    test('tags a diagnostic with the executing grid', () => {
        _configureDiagnostics({ capture: true });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _runWithActiveGrid('grid-a', () => _warn(11));
        _warn(11); // no active grid

        expect(received.map((e) => e.gridId)).toEqual(['grid-a', undefined]);
        off();
    });

    test('attributes to the innermost grid when grids nest', () => {
        _configureDiagnostics({ capture: true });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _runWithActiveGrid('outer', () => {
            _runWithActiveGrid('inner', () => _warn(11));
            _warn(11); // back to the outer grid
        });

        expect(received.map((e) => e.gridId)).toEqual(['inner', 'outer']);
        off();
    });

    test('a grid listener receives only its own grid plus untied diagnostics', () => {
        _configureDiagnostics({ capture: true });
        const a: CapturedDiagnostic[] = [];
        const b: CapturedDiagnostic[] = [];
        const offA = _addDiagnosticListener('grid-a', (e) => a.push(e));
        const offB = _addDiagnosticListener('grid-b', (e) => b.push(e));

        _runWithActiveGrid('grid-a', () => _warn(11));
        _runWithActiveGrid('grid-b', () => _error(11));
        _warn(11); // untied — both listeners see it

        expect(a.map((e) => [e.gridId, e.severity])).toEqual([
            ['grid-a', 'warning'],
            [undefined, 'warning'],
        ]);
        expect(b.map((e) => [e.gridId, e.severity])).toEqual([
            ['grid-b', 'error'],
            [undefined, 'warning'],
        ]);
        offA();
        offB();
    });

    test('replays only matching buffered diagnostics to a grid listener', () => {
        _configureDiagnostics({ capture: true });
        _runWithActiveGrid('grid-a', () => _warn(11));
        _runWithActiveGrid('grid-b', () => _warn(11));

        const received: CapturedDiagnostic[] = [];
        const off = _addDiagnosticListener('grid-a', (e) => received.push(e));

        expect(received.map((e) => e.gridId)).toEqual(['grid-a']);
        off();
    });

    test('pops the active grid even when a diagnostic throws', () => {
        _configureDiagnostics({ capture: true, throwOn: 'error' });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        expect(() => _runWithActiveGrid('grid-a', () => _error(11))).toThrow();
        // Stack is balanced, so the next untied diagnostic is not attributed to `grid-a`
        _configureDiagnostics({ throwOn: false });
        _warn(11);

        expect(received.map((e) => e.gridId)).toEqual(['grid-a', undefined]);
        off();
    });
});

// The grid-id-first variants are what the grid-scoped LogService delegates to, so a bean attributes its
// own diagnostics without establishing an active-grid scope — the mechanism that removes the fragile dance.
describe('explicit grid attribution', () => {
    test('tags a diagnostic with the supplied grid id, with no active-grid scope', () => {
        _configureDiagnostics({ capture: true });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _warnG('grid-a', 11);
        _errorG('grid-b', 11);
        _deprecatedG('grid-a', 11);

        expect(received.map((e) => [e.gridId, e.severity])).toEqual([
            ['grid-a', 'warning'],
            ['grid-b', 'error'],
            ['grid-a', 'deprecation'],
        ]);
        off();
    });

    test('an explicit grid id wins over the active-grid scope', () => {
        _configureDiagnostics({ capture: true });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        // Even inside another grid's scope, a bean's own id (passed explicitly) is what attributes it.
        _runWithActiveGrid('scope-grid', () => _warnG('own-grid', 11));

        expect(received.map((e) => e.gridId)).toEqual(['own-grid']);
        off();
    });

    test('an undefined grid id falls back to the active-grid scope', () => {
        _configureDiagnostics({ capture: true });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _runWithActiveGrid('scope-grid', () => _warnG(undefined, 11));
        _warnG(undefined, 11); // no scope either — untied

        expect(received.map((e) => e.gridId)).toEqual(['scope-grid', undefined]);
        off();
    });

    test('logs to the console like the free functions regardless of attribution', () => {
        _warnG('grid-a', 11);
        _errorG('grid-a', 11);

        expect(mockWarnOnce).toHaveBeenCalledTimes(1);
        expect(mockErrorOnce).toHaveBeenCalledTimes(1);
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

describe('suppression', () => {
    test('keeps a suppressed id out of the overlay but still logs it to the console', () => {
        _configureDiagnostics({ capture: true, suppress: [11] });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _warn(11);
        _warn(22, { key: 'x' });

        // Suppressed id 11 is not captured; 22 is
        expect(received.map((e) => e.id)).toEqual([22]);
        // The console log fires regardless of suppression
        expect(mockWarnOnce).toHaveBeenCalledTimes(2);
        off();
    });

    test('does not throw a suppressed id even when it meets the throw threshold', () => {
        _configureDiagnostics({ throwOn: 'error', suppress: [11] });

        expect(() => _error(11)).not.toThrow();
        expect(() => _error(22, { key: 'x' })).toThrow();
    });
});

describe('dev validation config', () => {
    test('registering without options resets a previously-configured throw threshold', () => {
        _applyDevValidationConfig({ throwOn: 'error' });
        expect(() => _error(11)).toThrow();

        // A later registration with no options must not inherit the earlier `throwOn`
        _applyDevValidationConfig();
        expect(() => _error(11)).not.toThrow();
    });

    test('registering without options clears a previously-configured suppress list', () => {
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _applyDevValidationConfig({ suppress: [11] });
        _warn(11);
        expect(received).toEqual([]);

        // A later registration with no options must not inherit the earlier suppress list
        _applyDevValidationConfig();
        _warn(11);
        expect(received.map((e) => e.id)).toEqual([11]);
        off();
    });

    test('enabling capture alone buffers diagnostics without a throw threshold', () => {
        _enableDiagnosticCapture();

        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));
        expect(() => _error(11)).not.toThrow();

        expect(received.map((e) => e.id)).toEqual([11]);
        off();
    });

    test('enabling capture does not clobber a throw threshold set by a with call', () => {
        _applyDevValidationConfig({ throwOn: 'error' });
        // A bare registration enables capture only, so the earlier throwOn must survive.
        _enableDiagnosticCapture();

        expect(() => _error(11)).toThrow();
    });
});

describe('bootstrap panel', () => {
    test('renders only the buffered diagnostics not tied to a grid', () => {
        _configureDiagnostics({ capture: true });
        _runWithActiveGrid('grid-a', () => _error(11)); // tied to a grid
        _logPreInitErr(200, {} as any, 'boom'); // a bootstrap failure, not tied to any grid

        const renderer = vi.fn();
        _provideBootstrapPanelRenderer(renderer);
        _renderBootstrapPanel(document.createElement('div'));

        expect(renderer).toHaveBeenCalledTimes(1);
        const passed = renderer.mock.calls[0][1] as CapturedDiagnostic[];
        expect(passed.map((d) => d.id)).toEqual([200]);
        expect(passed.every((d) => d.gridId === undefined)).toBe(true);
    });

    test('does not invoke the renderer when there are no untied diagnostics', () => {
        _configureDiagnostics({ capture: true });
        _runWithActiveGrid('grid-a', () => _error(11)); // tied only

        const renderer = vi.fn();
        _provideBootstrapPanelRenderer(renderer);
        _renderBootstrapPanel(document.createElement('div'));

        expect(renderer).not.toHaveBeenCalled();
    });

    test('consumes rendered diagnostics so a re-render does not repeat them', () => {
        _configureDiagnostics({ capture: true });
        _logPreInitErr(200, {} as any, 'boom');

        const renderer = vi.fn();
        _provideBootstrapPanelRenderer(renderer);

        // A re-created grid (e.g. React StrictMode) renders again; the consumed diagnostic must not repeat.
        _renderBootstrapPanel(document.createElement('div'));
        _renderBootstrapPanel(document.createElement('div'));

        expect(renderer).toHaveBeenCalledTimes(1);
    });
});

describe('getErrorLink serialisation', () => {
    function queryParams(url: string): URLSearchParams {
        return new URLSearchParams(url.split('?')[1]);
    }

    test('serialises an array param as a JSON array so it round-trips on the error page', () => {
        const url = getErrorLink(109, { inputValue: 'sm', allSuggestions: ['sum', 'avg'] } as any);

        expect(queryParams(url).get('allSuggestions')).toBe('["sum","avg"]');
    });

    test('keeps only primitive array elements, dropping nested objects/functions', () => {
        const url = getErrorLink(109, {
            inputValue: 'x',
            allSuggestions: ['a', { nested: 1 }, () => undefined, 'b'],
        } as any);

        expect(queryParams(url).get('allSuggestions')).toBe('["a","b"]');
    });
});
