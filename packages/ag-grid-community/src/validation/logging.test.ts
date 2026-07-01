import { _errorOnce, _warnOnce } from '../utils/log';
import type { CapturedDiagnostic } from './logging';
import {
    _addDiagnosticListener,
    _clearGridParent,
    _configureDiagnostics,
    _deprecated,
    _error,
    _logPreInitErr,
    _logPreInitWarn,
    _runWithActiveGrid,
    _setGridParent,
    _warn,
} from './logging';
import { _applyDevValidationConfig } from './validationConfig';

vi.mock('../utils/log', () => ({
    _warnOnce: vi.fn(),
    _errorOnce: vi.fn(),
}));

const mockWarnOnce = vi.mocked(_warnOnce);
const mockErrorOnce = vi.mocked(_errorOnce);

/** Attaches a page-level listener (no grid id) that receives every captured diagnostic. */
function listenAll(listener: (diagnostic: CapturedDiagnostic) => void): () => void {
    return _addDiagnosticListener(undefined, listener);
}

/** Resets the module-level diagnostic state between tests (flags off, buffer drained). */
function resetDiagnostics(): void {
    _configureDiagnostics({ capture: false, throwOn: false, suppress: [] });
    // Attaching then detaching the only listener drops the buffer (cleared on last detach).
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
        // Logging still happens regardless of capture.
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

        // First detach leaves a listener, so the buffer survives for a newcomer.
        off1();
        const afterFirstDetach: CapturedDiagnostic[] = [];
        const off3 = listenAll((e) => afterFirstDetach.push(e));
        expect(afterFirstDetach).toHaveLength(1);

        // Once every listener has gone the buffer is cleared.
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

    test("a nested grid's diagnostics surface on the emitting grid and its root, skipping intermediate levels", () => {
        _configureDiagnostics({ capture: true });
        // A three-level chain grandparent > parent > child; sibling is unrelated.
        _setGridParent('parent', 'grandparent');
        _setGridParent('child', 'parent');
        const child: CapturedDiagnostic[] = [];
        const parent: CapturedDiagnostic[] = [];
        const grandparent: CapturedDiagnostic[] = [];
        const sibling: CapturedDiagnostic[] = [];
        const offChild = _addDiagnosticListener('child', (e) => child.push(e));
        const offParent = _addDiagnosticListener('parent', (e) => parent.push(e));
        const offGrandparent = _addDiagnosticListener('grandparent', (e) => grandparent.push(e));
        const offSibling = _addDiagnosticListener('sibling', (e) => sibling.push(e));

        _runWithActiveGrid('child', () => _warn(11));

        // Reaches the emitting grid and the root (keeping its true origin); the intermediate parent and
        // unrelated siblings do not see it.
        expect(child.map((e) => e.gridId)).toEqual(['child']);
        expect(grandparent.map((e) => e.gridId)).toEqual(['child']);
        expect(parent).toEqual([]);
        expect(sibling).toEqual([]);

        offChild();
        offParent();
        offGrandparent();
        offSibling();
        _clearGridParent('parent');
        _clearGridParent('child');
    });

    test('terminates delivery even if duplicate gridIds form a cycle in the parent chain', () => {
        _configureDiagnostics({ capture: true });
        // A malformed chain from reused gridIds: a-> b-> a. The bounded walk must not loop forever.
        _setGridParent('a', 'b');
        _setGridParent('b', 'a');
        const received: CapturedDiagnostic[] = [];
        const off = _addDiagnosticListener('a', (e) => received.push(e));

        _runWithActiveGrid('a', () => _warn(11));

        // The emitting grid still sees its own diagnostic; the point is that this call returns at all.
        expect(received.map((e) => e.gridId)).toEqual(['a']);
        off();
        _clearGridParent('a');
        _clearGridParent('b');
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
        // Stack is balanced, so the next untied diagnostic is not attributed to grid-a.
        _configureDiagnostics({ throwOn: false });
        _warn(11);

        expect(received.map((e) => e.gridId)).toEqual(['grid-a', undefined]);
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

describe('suppression', () => {
    test('keeps a suppressed id out of the overlay but still logs it to the console', () => {
        _configureDiagnostics({ capture: true, suppress: [11] });
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _warn(11);
        _warn(22);

        // Suppressed id 11 is not captured; 22 is.
        expect(received.map((e) => e.id)).toEqual([22]);
        // The console log fires regardless of suppression.
        expect(mockWarnOnce).toHaveBeenCalledTimes(2);
        off();
    });

    test('does not throw a suppressed id even when it meets the throw threshold', () => {
        _configureDiagnostics({ throwOn: 'error', suppress: [11] });

        expect(() => _error(11)).not.toThrow();
        expect(() => _error(22)).toThrow();
    });
});

describe('dev validation config', () => {
    test('registering without options resets a previously-configured throw threshold', () => {
        _applyDevValidationConfig({ throwOn: 'error' });
        expect(() => _error(11)).toThrow();

        // A later registration with no options must not inherit the earlier throwOn.
        _applyDevValidationConfig();
        expect(() => _error(11)).not.toThrow();
    });

    test('registering without options clears a previously-configured suppress list', () => {
        const received: CapturedDiagnostic[] = [];
        const off = listenAll((e) => received.push(e));

        _applyDevValidationConfig({ suppress: [11] });
        _warn(11);
        expect(received).toEqual([]);

        // A later registration with no options must not inherit the earlier suppress list.
        _applyDevValidationConfig();
        _warn(11);
        expect(received.map((e) => e.id)).toEqual([11]);
        off();
    });
});
