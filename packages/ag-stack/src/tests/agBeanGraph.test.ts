import { describe, expect, it, vi } from 'vitest';

import type { AgDeclaredBean, AgGraphBean } from '../core/agBeanGraph';
import { createBeanGraph } from '../core/agBeanGraph';
import { AgContext } from '../core/agContext';
import type { IContext } from '../interfaces/iContext';

// Runs without a DOM environment on purpose: the code under test must work headless.

interface RecordedBean extends AgDeclaredBean<Record<string, unknown>> {
    wiredWith?: Record<string, unknown>;
}

const bean = (beanName: string, deps: string[] = [], optionalDeps: string[] = [], log?: string[]): RecordedBean => ({
    beanName,
    deps,
    optionalDeps,
    preWireBeans(beans) {
        (this as RecordedBean).wiredWith = beans;
    },
    postConstruct() {
        log?.push(`construct:${beanName}`);
    },
    destroy() {
        log?.push(`destroy:${beanName}`);
    },
});

describe('the bean graph', () => {
    it('constructs a bean after everything it declared', () => {
        const log: string[] = [];
        const graph = createBeanGraph({
            id: 'test',
            beans: [bean('c', ['b'], [], log), bean('a', [], [], log), bean('b', ['a'], [], log)],
        });

        expect(graph.order).toEqual(['a', 'b', 'c']);
        expect(log).toEqual(['construct:a', 'construct:b', 'construct:c']);
    });

    it('hands a bean its declared dependencies and nothing else', () => {
        const a = bean('a');
        const b = bean('b');
        const c = bean('c', ['a']);
        createBeanGraph({ id: 'test', beans: [a, b, c] });

        // `context` is part of the kernel, which every bean receives.
        expect(Object.keys(c.wiredWith!).sort()).toEqual(['a', 'context']);
        expect(c.wiredWith!.a).toBe(a);
        expect(c.wiredWith!.b).toBeUndefined();
    });

    it('passes a kernel value through without owning it', () => {
        const below = { name: 'below' };
        const a = bean('a', ['below']);
        const graph = createBeanGraph({ id: 'test', beans: [a], kernel: { below } });

        expect(a.wiredWith!.below).toBe(below);
        expect(graph.order).toEqual(['a']);
    });

    it('omits an absent optional dependency rather than failing', () => {
        const a = bean('a', [], ['maybe']);
        createBeanGraph({ id: 'test', beans: [a] });

        expect('maybe' in a.wiredWith!).toBe(false);
    });

    it('orders an optional dependency that is present', () => {
        const graph = createBeanGraph({ id: 'test', beans: [bean('a', [], ['b']), bean('b')] });

        expect(graph.order).toEqual(['b', 'a']);
    });

    it('destroys in reverse construction order', () => {
        const log: string[] = [];
        const graph = createBeanGraph({
            id: 'test',
            beans: [bean('a', [], [], log), bean('b', ['a'], [], log)],
        });
        log.length = 0;

        graph.destroy();

        expect(log).toEqual(['destroy:b', 'destroy:a']);
    });

    it('names the beans in a cycle', () => {
        expect(() =>
            createBeanGraph({ id: 'test', beans: [bean('a', ['b']), bean('b', ['c']), bean('c', ['a'])] })
        ).toThrow(/cycle: a -> b -> c -> a/);
    });

    it('names a missing dependency and the bean that wanted it', () => {
        expect(() => createBeanGraph({ id: 'config', beans: [bean('a', ['nope'])] })).toThrow(
            /'a' in the config graph depends on 'nope'/
        );
    });

    it('rejects two beans with the same name', () => {
        expect(() => createBeanGraph({ id: 'test', beans: [bean('a'), bean('a')] })).toThrow(/two beans named 'a'/);
    });

    it('wires every bean before any postConstruct runs', () => {
        // `a` sorts first, so a single-pass container would construct it before `b` is wired.
        const b = bean('b');
        let bWasWired = false;
        const a: RecordedBean = {
            beanName: 'a',
            deps: [],
            postConstruct() {
                bWasWired = b.wiredWith !== undefined;
            },
        };
        createBeanGraph({ id: 'test', beans: [a, b] });

        expect(bWasWired).toBe(true);
    });

    it('builds a runtime bean against what is already there', () => {
        const a = bean('a');
        const graph = createBeanGraph({ id: 'test', beans: [a] });
        const child = bean('child', ['a']);
        const onConstruct = vi.spyOn(child, 'postConstruct');

        graph.createBean(child);

        expect(child.wiredWith!.a).toBe(a);
        expect(onConstruct).toHaveBeenCalledOnce();
    });
});

describe('a bean that declares nothing', () => {
    it('is handed the whole collection, as its type says it is', () => {
        const other = bean('other');
        const undeclared = bean('undeclared');
        createBeanGraph({ id: 'test', beans: [other, undeclared], kernel: { gos: {} } });

        expect(undeclared.wiredWith!.other).toBe(other);
        expect(undeclared.wiredWith!.gos).toBeDefined();
    });
});

describe('what a declared bean is handed at run time', () => {
    it('includes the ambient beans its type promises', () => {
        const gos = { name: 'gos' };
        const alpha = bean('alpha');
        const declared = bean('declared', ['alpha']);
        createBeanGraph({ id: 'test', beans: [alpha, declared], kernel: { gos } });

        expect(declared.wiredWith!.alpha).toBe(alpha);
        expect(declared.wiredWith!.gos).toBe(gos);
    });

    it('lets an undeclared bean see one built after it', () => {
        const first = bean('first');
        const second = bean('second');
        createBeanGraph({ id: 'test', beans: [first, second] });

        expect(first.wiredWith!.second).toBe(second);
    });
});

describe('a bean built after the graph', () => {
    it('is refused when it names something that was never built', () => {
        const graph = createBeanGraph({ id: 'test', beans: [bean('a')] });

        expect(() => graph.createBean(bean('child', ['missing']))).toThrow(/'child'.*depends on 'missing'/);
    });

    it('does not construct the bean it refused', () => {
        const graph = createBeanGraph({ id: 'test', beans: [bean('a')] });
        const child = bean('child', ['missing']);

        expect(() => graph.createBean(child)).toThrow();
        expect(child.wiredWith).toBeUndefined();
    });
});

describe('a bean created by a declared bean', () => {
    const build = () => {
        const a = bean('a');
        const secret = bean('secret');
        const owner = bean('owner', ['a']);
        createBeanGraph({ id: 'test', beans: [a, secret, owner] });
        return { a, secret, container: owner.wiredWith!.context as IContext<Record<string, unknown>> };
    };

    it('is handed the whole collection when it declares nothing, whoever creates it', () => {
        const { a, secret, container } = build();
        const child = bean('child');

        container.createBean(child);

        expect(child.wiredWith!.a).toBe(a);
        expect(child.wiredWith!.secret).toBe(secret);
    });

    it('is handed what it declares, even beans its creator was not', () => {
        const { secret, container } = build();
        const child = bean('child', ['secret']);

        container.createBean(child);

        expect(child.wiredWith!.secret).toBe(secret);
        expect(child.wiredWith!.a).toBeUndefined();
    });

    it('is refused when it declares a bean the graph never built', () => {
        const { container } = build();

        expect(() => container.createBean(bean('child', ['missing']))).toThrow(/'child'.*depends on 'missing'/);
    });

    it('leaves its creator unable to look up what the creator did not declare', () => {
        const { container } = build();

        expect(container.getBean('secret')).toBeUndefined();
        expect(container.getBeans()).not.toHaveProperty('secret');
    });
});

describe('a destroyed graph', () => {
    it('releases every bean', () => {
        const graph = createBeanGraph({ id: 'test', beans: [bean('a'), bean('b')] });

        graph.destroy();

        expect(graph.getBeans()).toEqual({});
    });
});

describe('a bean already owned by another graph', () => {
    it('is refused as a kernel bean, without being built again', () => {
        const log: string[] = [];
        const eventSvc = bean('eventSvc', [], [], log);
        createBeanGraph({ id: 'first', beans: [eventSvc] });

        expect(() => createBeanGraph({ id: 'second', kernel: { eventSvc }, beans: [] })).toThrow(
            /'eventSvc' already belongs to the first graph/
        );
        expect(log).toEqual(['construct:eventSvc']);
    });

    it('is refused as a registered bean', () => {
        const a = bean('a');
        createBeanGraph({ id: 'first', beans: [a] });

        expect(() => createBeanGraph({ id: 'second', beans: [a] })).toThrow(/'a' already belongs to the first graph/);
    });

    it('is refused by createBean, without being constructed again', () => {
        const log: string[] = [];
        const a = bean('a', [], [], log);
        createBeanGraph({ id: 'first', beans: [a] });
        const second = createBeanGraph({ id: 'second', beans: [] });

        expect(() => second.createBean(a)).toThrow(/'a' already belongs to the first graph/);
        expect(log).toEqual(['construct:a']);
    });

    it('is refused by destroyBean from a graph sharing its id', () => {
        const log: string[] = [];
        const a = bean('a', [], [], log);
        createBeanGraph({ id: 'test', beans: [a] });
        const other = createBeanGraph({ id: 'test', beans: [] });

        expect(() => other.destroyBean(a)).toThrow(/'a' belongs to the test graph and cannot be destroyed/);
        expect(log).toEqual(['construct:a']);
    });

    it('is refused by destroyBean, and left running', () => {
        const log: string[] = [];
        const a = bean('a', [], [], log);
        createBeanGraph({ id: 'first', beans: [a] });
        const second = createBeanGraph({ id: 'second', beans: [] });

        expect(() => second.destroyBean(a)).toThrow(/'a' belongs to the first graph and cannot be destroyed/);
        expect(log).toEqual(['construct:a']);
    });
});

describe('instance ids', () => {
    it('come from the counter AgContext uses, so a graph never repeats a context id', () => {
        const first = createBeanGraph({ id: 'test', beans: [] }).instanceId;
        const context = new AgContext(undefined as never).instanceId;
        const second = createBeanGraph({ id: 'test', beans: [] }).instanceId;

        expect([context, second]).toEqual([first + 1, first + 2]);
    });
});

describe('a bean that destroys the graph while it is built', () => {
    type Context = IContext<Record<string, unknown>>;

    it('stops construction and tears down once', () => {
        const log: string[] = [];
        const destroyCallback = vi.fn();
        let context: Context;
        const quitter: AgGraphBean = {
            beanName: 'quitter',
            preWireBeans(beans) {
                context = beans.context as Context;
            },
            postConstruct() {
                log.push('construct:quitter');
                context.destroy();
            },
            destroy() {
                log.push('destroy:quitter');
            },
        };

        const graph = createBeanGraph({
            id: 'test',
            beans: [bean('first', [], [], log), quitter, bean('last', [], [], log)],
            destroyCallback,
        });

        expect(graph.isDestroyed()).toBe(true);
        expect(log).toEqual([
            'construct:first',
            'construct:quitter',
            'destroy:last',
            'destroy:quitter',
            'destroy:first',
        ]);
        expect(destroyCallback).toHaveBeenCalledTimes(1);
    });

    it('wires nothing after it', () => {
        const destroyCallback = vi.fn();
        const quitter: AgGraphBean = {
            beanName: 'quitter',
            preWireBeans(beans) {
                (beans.context as Context).destroy();
            },
        };
        const last = bean('last');

        createBeanGraph({ id: 'test', beans: [bean('first'), quitter, last], destroyCallback });

        expect(last.wiredWith).toBeUndefined();
        expect(destroyCallback).toHaveBeenCalledTimes(1);
    });
});

describe('a bean that throws while constructing', () => {
    it('destroys the ones already built', () => {
        const log: string[] = [];
        const first = bean('first', [], [], log);
        const boom: AgGraphBean = {
            beanName: 'boom',
            deps: ['first'],
            postConstruct() {
                throw new Error('boom');
            },
        };

        expect(() => createBeanGraph({ id: 'test', beans: [first, boom] })).toThrow('boom');
        expect(log).toEqual(['construct:first', 'destroy:first']);
    });

    it('also destroys the ones it wired but never constructed, then runs the destroy callback', () => {
        const log: string[] = [];
        const boom: AgGraphBean = {
            beanName: 'boom',
            postConstruct() {
                throw new Error('boom');
            },
        };
        const after = bean('after', ['boom'], [], log);
        const destroyCallback = vi.fn();

        expect(() => createBeanGraph({ id: 'test', beans: [boom, after], destroyCallback })).toThrow('boom');
        expect(log).toEqual(['destroy:after']);
        expect(destroyCallback).toHaveBeenCalledOnce();
    });
});

describe('the kernel', () => {
    const kernelBean = (beanName: string, log: string[]) => ({
        beanName,
        postConstruct() {
            log.push(`construct:${beanName}`);
        },
        destroy() {
            log.push(`destroy:${beanName}`);
        },
    });

    it('builds a kernel bean before the registered ones and destroys it after them', () => {
        const log: string[] = [];
        const graph = createBeanGraph({
            id: 'test',
            kernel: { eventSvc: kernelBean('eventSvc', log) },
            beans: [bean('a', [], [], log)],
        });

        expect(graph.order).toEqual(['eventSvc', 'a']);
        expect(log).toEqual(['construct:eventSvc', 'construct:a']);

        graph.destroy();

        expect(log).toEqual(['construct:eventSvc', 'construct:a', 'destroy:a', 'destroy:eventSvc']);
    });

    it('shares a member with no beanName without running its lifecycle', () => {
        const log: string[] = [];
        // Shaped like a component: every lifecycle hook, but no `beanName`.
        const rootComp = { postConstruct: () => log.push('construct:rootComp') };
        const a = bean('a');

        const graph = createBeanGraph({ id: 'test', kernel: { rootComp }, beans: [a] });

        expect(graph.order).toEqual(['a']);
        expect(log).toEqual([]);
        expect(a.wiredWith!.rootComp).toBe(rootComp);
    });

    it('carries the kernel into a declaring bean, which declared none of it', () => {
        const gos = { name: 'gos' };
        const declared = bean('declared', ['a']);

        createBeanGraph({ id: 'test', kernel: { gos }, beans: [bean('a'), declared] });

        expect(declared.wiredWith!.gos).toBe(gos);
        expect(declared.wiredWith!.a).toBeDefined();
    });

    it('satisfies a declared dependency on the container it installs', () => {
        const a = bean('a', ['context']);

        createBeanGraph({ id: 'test', beans: [a] });

        expect(a.wiredWith!.context).toBeDefined();
    });

    it('installs itself as the container, which is not a bean', () => {
        const a = bean('a');
        const graph = createBeanGraph({ id: 'test', beans: [a, bean('b')] });

        expect(a.wiredWith!.context).toBe(graph);
        expect(graph.order).not.toContain('context');
    });

    it('hands a declared bean a container scoped to what it declared', () => {
        const a = bean('a', ['b']);
        const graph = createBeanGraph({ id: 'test', beans: [a, bean('b')] });
        const container = a.wiredWith!.context as IContext<Record<string, unknown>>;

        expect(container).not.toBe(graph);
        expect(container.getId()).toBe('test');
        expect(container.instanceId).toBe(graph.instanceId);
    });

    it('leaves a container it was handed alone', () => {
        const context = { name: 'outer' };
        const a = bean('a');

        createBeanGraph({ id: 'test', kernel: { context }, beans: [a] });

        expect(a.wiredWith!.context).toBe(context);
    });

    it('refuses a member held under a key that is not its own name', () => {
        expect(() => createBeanGraph({ id: 'test', kernel: { gos: { beanName: 'eventSvc' } }, beans: [] })).toThrow(
            /'eventSvc' under the kernel key 'gos'/
        );
    });

    it('refuses a kernel bean that declares dependencies', () => {
        expect(() =>
            createBeanGraph({ id: 'test', kernel: { gos: { beanName: 'gos', deps: ['a'] } }, beans: [bean('a')] })
        ).toThrow(/cannot declare dependencies/);
    });

    it('refuses a registered bean that shadows a kernel one', () => {
        expect(() =>
            createBeanGraph({ id: 'test', kernel: { gos: { beanName: 'gos' } }, beans: [bean('gos')] })
        ).toThrow(/two beans named 'gos'/);
    });
});
