import { LocalEventService } from './localEventService';

type T = 'a' | 'b';

describe('LocalEventService', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test("keeps a browser event's composed path readable by an async listener after the browser dispatch ends", () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        const paths: unknown[] = [];
        svc.addEventListener('a', (event) => paths.push('eventPath' in event ? event.eventPath : undefined), true);
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.addEventListener('click', (event) => svc.dispatchEvent({ type: 'a', event }));
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        button.remove();

        vi.runAllTimers();
        expect(paths).toEqual([[button, document.body, document.documentElement, document, expect.anything()]]);
    });

    test('calls per-type listeners before global ones, sync inline and async on the next flush', () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        svc.addGlobalListener((type) => log.push(`global async ${type}`), true);
        svc.addGlobalListener((type) => log.push(`global sync ${type}`));
        svc.addEventListener('a', () => log.push('async 1'), true);
        svc.addEventListener('a', () => log.push('sync 1'));
        svc.addEventListener('a', () => log.push('sync 2'));
        svc.addEventListener('b', () => log.push('sync b'));

        svc.dispatchEvent({ type: 'a' });
        expect(log).toEqual(['sync 1', 'sync 2', 'global sync a']);

        vi.runAllTimers();
        expect(log).toEqual(['sync 1', 'sync 2', 'global sync a', 'async 1', 'global async a']);
    });

    test('a listener added while its own list is being dispatched waits for the next dispatch', () => {
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        const late = () => log.push('late');
        const lateGlobal = () => log.push('late global');
        const globalFromPerType = () => log.push('global from per-type');
        let added = false;
        svc.addEventListener('a', () => {
            log.push('first');
            if (!added) {
                svc.addEventListener('a', late);
                svc.addGlobalListener(globalFromPerType);
            }
        });
        svc.addGlobalListener(() => {
            log.push('global');
            if (!added) {
                added = true;
                svc.addGlobalListener(lateGlobal);
            }
        });

        svc.dispatchEvent({ type: 'a' });
        expect(log).toEqual(['first', 'global', 'global from per-type']);

        log.length = 0;
        svc.dispatchEvent({ type: 'a' });
        expect(log).toEqual(['first', 'late', 'global', 'global from per-type', 'late global']);
    });

    test('a per-type listener removed during a dispatch is skipped, a global one only before the global pass', () => {
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        const second = () => log.push('second');
        const removedByPerType = () => log.push('removed by per-type');
        const removedByGlobal = () => log.push('removed by global');
        svc.addEventListener('a', () => {
            log.push('first');
            svc.removeEventListener('a', second);
            svc.removeGlobalListener(removedByPerType);
        });
        svc.addEventListener('a', second);
        svc.addGlobalListener(() => {
            log.push('global');
            svc.removeGlobalListener(removedByGlobal);
        });
        svc.addGlobalListener(removedByPerType);
        svc.addGlobalListener(removedByGlobal);

        svc.dispatchEvent({ type: 'a' });

        expect(log).toEqual(['first', 'global', 'removed by global']);
    });

    test('a listener removed and re-added during a dispatch is called unless its type emptied in between', () => {
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        const first = () => {
            log.push('first');
            svc.removeEventListener('a', second);
            svc.addEventListener('a', second);
        };
        const second = () => log.push('second');
        svc.addEventListener('a', first);
        svc.addEventListener('a', second);

        svc.dispatchEvent({ type: 'a' });
        expect(log).toEqual(['first', 'second']);

        const emptying = new LocalEventService<T>();
        const emptyingLog: string[] = [];
        const emptyingFirst = () => {
            emptyingLog.push('first');
            emptying.removeEventListener('a', emptyingFirst);
            emptying.removeEventListener('a', emptyingSecond);
            emptying.addEventListener('a', emptyingSecond);
        };
        const emptyingSecond = () => emptyingLog.push('second');
        emptying.addEventListener('a', emptyingFirst);
        emptying.addEventListener('a', emptyingSecond);

        emptying.dispatchEvent({ type: 'a' });
        expect(emptyingLog).toEqual(['first']);

        emptying.dispatchEvent({ type: 'a' });
        expect(emptyingLog).toEqual(['first', 'second']);
    });

    test('a listener removed by a nested dispatch of the same type is skipped by the outer one too', () => {
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        let depth = 0;
        const third = () => log.push(`third ${depth}`);
        svc.addEventListener('a', () => {
            log.push(`first ${depth}`);
            if (depth === 0) {
                ++depth;
                svc.addEventListener('a', () => log.push(`extra ${depth}`));
                svc.dispatchEvent({ type: 'a' });
                --depth;
            }
        });
        svc.addEventListener('a', () => {
            log.push(`second ${depth}`);
            svc.removeEventListener('a', third);
        });
        svc.addEventListener('a', third);

        svc.dispatchEvent({ type: 'a' });

        expect(log).toEqual(['first 0', 'first 1', 'second 1', 'extra 1', 'second 0']);
    });

    test('an async listener queued by a dispatch runs even if removed before the flush', () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        const listener = vi.fn();
        svc.addEventListener('a', listener, true);

        svc.dispatchEvent({ type: 'a' });
        svc.removeEventListener('a', listener, true);
        vi.runAllTimers();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test('a dispatch from inside an async listener is delivered in a later flush', () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        svc.addEventListener(
            'a',
            () => {
                log.push('a');
                svc.dispatchEvent({ type: 'b' });
            },
            true
        );
        svc.addEventListener('b', () => log.push('b'), true);

        svc.dispatchEvent({ type: 'a' });
        vi.advanceTimersToNextTimer();
        expect(log).toEqual(['a']);

        vi.advanceTimersToNextTimer();
        expect(log).toEqual(['a', 'b']);
    });

    test('runs every listener inside the framework wrapIncoming, async ones at flush', () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        let depth = 0;
        const wrapIncoming = <R>(callback: () => R): R => {
            ++depth;
            try {
                return callback();
            } finally {
                --depth;
            }
        };
        svc.setFrameworkOverrides({ wrapIncoming, wrapOutgoing: (callback) => callback() });
        const calls: string[] = [];
        const listener = (name: string) => () => calls.push(`${name} at depth ${depth}`);
        svc.addEventListener('a', listener('sync 1'));
        svc.addEventListener('a', listener('sync 2'));
        svc.addEventListener('a', listener('async 1'), true);
        svc.addEventListener('a', listener('async 2'), true);
        svc.addGlobalListener(listener('global'));
        svc.addGlobalListener(listener('global async'), true);

        svc.dispatchEvent({ type: 'a' });
        expect(calls).toEqual(['sync 1 at depth 1', 'sync 2 at depth 1', 'global at depth 1']);

        vi.runAllTimers();
        expect(calls.slice(3)).toEqual(['async 1 at depth 1', 'async 2 at depth 1', 'global async at depth 1']);
    });

    test('a global listener given event types receives only those, in its place among the global listeners', () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        const onlyA: ReadonlySet<T> = new Set<T>(['a']);
        svc.addGlobalListener((type) => log.push(`before ${type}`));
        svc.addGlobalListener((type) => log.push(`filtered ${type}`), false, onlyA);
        svc.addGlobalListener((type) => log.push(`after ${type}`));
        svc.addGlobalListener((type) => log.push(`filtered async ${type}`), true, onlyA);

        svc.dispatchEvent({ type: 'b' });
        vi.runAllTimers();
        expect(log).toEqual(['before b', 'after b']);

        svc.dispatchEvent({ type: 'a' });
        vi.runAllTimers();
        expect(log).toEqual(['before b', 'after b', 'before a', 'filtered a', 'after a', 'filtered async a']);
    });

    test('a filtered global listener removed during a dispatch is not called for an event outside its types', () => {
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        const filtered = (type: T) => log.push(`filtered ${type}`);
        svc.addGlobalListener((type) => {
            if (type === 'b') {
                svc.removeGlobalListener(filtered);
            }
        });
        svc.addGlobalListener(filtered, false, new Set<T>(['a']));

        svc.dispatchEvent({ type: 'b' });
        expect(log).toEqual([]);
    });

    test('removing a global listener that was never added leaves the registered ones', () => {
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        svc.removeGlobalListener(() => {});
        svc.addGlobalListener((type) => log.push(`kept ${type}`));

        svc.removeGlobalListener(() => {});
        svc.dispatchEvent({ type: 'a' });
        expect(log).toEqual(['kept a']);
    });

    test('an async global listener skipped for an event keeps the next async delivery ahead of a timer set after it', () => {
        vi.useFakeTimers();
        const svc = new LocalEventService<T>();
        const log: string[] = [];
        svc.addGlobalListener((type) => log.push(`filtered async ${type}`), true, new Set<T>(['a']));

        svc.dispatchEvent({ type: 'b' });
        setTimeout(() => log.push('timer'), 0);
        svc.dispatchEvent({ type: 'a' });
        vi.runAllTimers();
        expect(log).toEqual(['filtered async a', 'timer']);
    });

    test('reports listeners as registered only while one of any kind is added, not after removing or dispatching nothing', () => {
        const svc = new LocalEventService<T>();
        const listener = () => {};
        const globalListener = () => {};
        const kinds: [string, () => void, () => void][] = [
            ['sync', () => svc.addEventListener('a', listener), () => svc.removeEventListener('a', listener)],
            [
                'async',
                () => svc.addEventListener('a', listener, true),
                () => svc.removeEventListener('a', listener, true),
            ],
            [
                'global sync',
                () => svc.addGlobalListener(globalListener),
                () => svc.removeGlobalListener(globalListener),
            ],
            [
                'global async',
                () => svc.addGlobalListener(globalListener, true),
                () => svc.removeGlobalListener(globalListener, true),
            ],
        ];
        const report = (kind: string) => ({
            kind,
            none: svc.noRegisteredListenersExist(),
            a: svc.hasListeners('a'),
            b: svc.hasListeners('b'),
        });
        expect(report('initial')).toEqual({ kind: 'initial', none: true, a: false, b: false });
        svc.removeEventListener('a', listener);
        svc.removeEventListener('a', listener, true);
        svc.dispatchEvent({ type: 'a' });
        expect(report('nothing added')).toEqual({ kind: 'nothing added', none: true, a: false, b: false });
        for (const [kind, add, remove] of kinds) {
            add();
            const global = kind.startsWith('global');
            expect(report(kind)).toEqual({ kind, none: false, a: true, b: global });
            remove();
            expect(report(kind)).toEqual({ kind, none: true, a: false, b: false });
        }
    });
});
