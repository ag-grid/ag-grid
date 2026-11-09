import type { AgBaseBean } from '../interfaces/agBaseBean';
import type { IContext } from '../interfaces/iContext';
import { _nextContainerInstanceId } from './containerInstanceId';

/** The graph that built each registered or kernel bean, so no other graph builds or destroys it. */
/** Compared by identity, since two graphs may share an `id`. */
interface GraphOwner {
    readonly id: string;
}

const owningGraph = new WeakMap<object, GraphOwner>();

/**
 * Exactly the declared dependencies: required ones guaranteed, optional ones possibly absent.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type AgBeanView<
    TBeans,
    TDeps extends readonly (keyof TBeans)[],
    TOptional extends readonly (keyof TBeans)[] = [],
> = { [K in TDeps[number]]: TBeans[K] } & { [K in TOptional[number]]?: TBeans[K] };

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgDeclaredDeps<TBeans> = readonly (keyof TBeans & string)[];

/**
 * What a bean can reach: its declared dependencies, or the whole collection if it declared none.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type AgBeansFor<TBeans, TDeps extends AgDeclaredDeps<TBeans>, TOptional extends AgDeclaredDeps<TBeans>> = [
    TDeps,
    TOptional,
] extends [readonly [], readonly []]
    ? TBeans
    : AgBeanView<TBeans, TDeps, TOptional>;

/**
 * A bean that declares no dependencies: it receives the whole collection and keeps its registered position.
 * @knipIgnore Part of `createBeanGraph`'s contract.
 */
export interface AgUndeclaredBean<TBeans> extends AgBaseBean<TBeans> {
    /** Optional to match `AgSingletonBean`; the graph rejects a bean without one. */
    readonly beanName?: string;
    readonly deps?: readonly [];
    readonly optionalDeps?: readonly [];
}

/**
 * A bean that declares its dependencies, and is therefore sorted and narrowed.
 *
 * `wireBeans` and `preConstruct` are banned because they could copy out a bean the sort never saw.
 * @knipIgnore Part of `createBeanGraph`'s contract.
 */
export interface AgDeclaredBean<TBeans> extends AgBaseBean<TBeans> {
    /** Optional to match `AgSingletonBean`; the graph rejects a bean without one. */
    readonly beanName?: string;
    /** Required: a missing one fails the build of the graph. */
    readonly deps?: readonly (keyof TBeans & string)[];
    /** Used if registered, otherwise absent. */
    readonly optionalDeps?: readonly (keyof TBeans & string)[];
    wireBeans?: never;
    preConstruct?: never;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgGraphBean<TBeans = Record<string, unknown>> = AgUndeclaredBean<TBeans> | AgDeclaredBean<TBeans>;

/** @knipIgnore Part of `createBeanGraph`'s contract. */
export interface AgBeanGraphParams<TBeans = Record<string, unknown>> {
    /** Named in every error, so a message says which graph rejected a bean. */
    id: string;
    beans: readonly AgGraphBean<TBeans>[];
    /**
     * Shared with every bean without being declared. A member with a `beanName` is a bean, built
     * before and destroyed after the registered ones; any other member is a plain value.
     * The graph adds itself as `context` unless one is supplied.
     */
    kernel?: Partial<TBeans>;
    destroyCallback?: () => void;
}

/**
 * A built graph, usable anywhere an `AgContext` is.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface AgBeanGraph<TBeans = Record<string, unknown>> extends IContext<TBeans> {
    /** Everything built plus the kernel. `TBeans` is the caller's claim; the graph cannot check it. */
    readonly beans: TBeans;
    /** Construction order, for tests and diagnostics. */
    readonly order: readonly string[];
}

/** Separate passes, so a `postConstruct` can rely on every bean in the set being wired. */
function initBeans<TBeans>(
    instances: readonly AgBaseBean<TBeans>[],
    beansFor: (bean: AgBaseBean<TBeans>) => TBeans,
    afterPreCreateCallback?: (bean: AgBaseBean<TBeans>) => void
): void {
    for (const instance of instances) {
        const view = beansFor(instance);
        instance.preWireBeans?.(view);
        instance.wireBeans?.(view);
    }
    for (const instance of instances) {
        instance.preConstruct?.();
    }
    if (afterPreCreateCallback) {
        for (const instance of instances) {
            afterPreCreateCallback(instance);
        }
    }
    for (const instance of instances) {
        instance.postConstruct?.();
    }
}

/**
 * Builds beans in dependency order, handing each declaring bean only what it declared. A declaring
 * bean's container is scoped to the same view, so beans it creates or looks up are narrowed too.
 *
 * Throws on a duplicate bean name, a missing required dependency, a cycle, or a bean another graph
 * already owns, naming the beans involved.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function createBeanGraph<TBeans = Record<string, unknown>>({
    id,
    beans,
    kernel = {},
    destroyCallback,
}: AgBeanGraphParams<TBeans>): AgBeanGraph<TBeans> {
    const self: GraphOwner = { id };
    const built: Record<string, unknown> = { ...kernel };

    const kernelBeans = new Map<string, AgGraphBean<TBeans>>();
    for (const key of Object.keys(built)) {
        const bean = built[key] as Partial<AgDeclaredBean<TBeans>> | undefined;
        if (bean?.beanName == null) {
            continue;
        }
        if (bean.beanName !== key) {
            throw new Error(`AG Stack: the ${id} graph was given '${bean.beanName}' under the kernel key '${key}'.`);
        }
        if (bean.deps?.length || bean.optionalDeps?.length) {
            throw new Error(
                `AG Stack: '${key}' is a kernel bean in the ${id} graph and cannot declare dependencies; it is built before anything else.`
            );
        }
        kernelBeans.set(key, bean as AgGraphBean<TBeans>);
    }

    const kernelKeys = Object.keys(kernel);

    const owned = new Map<string, AgGraphBean<TBeans>>();
    for (const bean of beans) {
        const { beanName } = bean;
        if (!beanName) {
            throw new Error(`AG Stack: a bean registered in the ${id} graph has no beanName.`);
        }
        if (owned.has(beanName) || kernelBeans.has(beanName)) {
            throw new Error(`AG Stack: the ${id} graph registered two beans named '${beanName}'.`);
        }
        owned.set(beanName, bean);
    }

    const requireDeps = (
        beanName: string,
        deps: readonly string[] | undefined,
        available: (dep: string) => boolean
    ): void => {
        for (const dep of deps ?? []) {
            if (!available(dep)) {
                throw new Error(
                    `AG Stack: '${beanName}' in the ${id} graph depends on '${dep}', which is not available here.`
                );
            }
        }
    };

    // The graph installs itself as `context` once built, if the kernel supplies none.
    const isAvailable = (dep: string): boolean => dep === 'context' || owned.has(dep) || built[dep] !== undefined;
    for (const bean of owned.values()) {
        requireDeps(bean.beanName!, bean.deps, isAvailable);
    }

    // Kernel first, so destruction (which walks this in reverse) tears it down last.
    const order = [...kernelBeans.keys(), ...sortTopologically(owned, id)];
    const all = new Map<string, AgGraphBean<TBeans>>([...kernelBeans, ...owned]);

    const assertUnowned = (name: string, bean: object): void => {
        const owner = owningGraph.get(bean);
        if (owner !== undefined) {
            throw new Error(
                `AG Stack: '${name}' already belongs to the ${owner.id} graph and cannot also be built by the ${id} graph.`
            );
        }
    };
    for (const [name, bean] of all) {
        assertUnowned(name, bean);
    }
    for (const bean of all.values()) {
        owningGraph.set(bean, self);
    }

    let destroyed = false;

    const createIn = <T extends AgBaseBean<TBeans>>(
        source: Record<string, unknown>,
        bean: T,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeans>) => void
    ): T => {
        const { beanName = '(runtime bean)', deps, optionalDeps } = bean as Partial<AgDeclaredBean<TBeans>>;
        assertUnowned(beanName, bean);
        requireDeps(beanName, deps, (dep) => source[dep] !== undefined);
        initBeans([bean], () => viewFor({ deps, optionalDeps }, source) as TBeans, afterPreCreateCallback);
        return bean;
    };

    const scopedContext = (view: Record<string, unknown>): IContext<TBeans> => {
        const base = built.context as IContext<TBeans>;
        return {
            get instanceId() {
                return base.instanceId;
            },
            getId: () => base.getId(),
            isDestroyed: () => base.isDestroyed(),
            destroy: () => base.destroy(),
            destroyBean: (bean) => base.destroyBean(bean),
            destroyBeans: (list) => base.destroyBeans(list),
            getBeans: () => view as TBeans,
            getBean: (name) => (view as TBeans)[name],
            createBean: (bean, afterPreCreateCallback) => createIn(view, bean, afterPreCreateCallback),
        };
    };

    const viewFor = (
        bean: { readonly deps?: readonly string[]; readonly optionalDeps?: readonly string[] },
        source: Record<string, unknown>
    ): Record<string, unknown> => {
        const { deps, optionalDeps } = bean;
        // The live source, not a copy, so an undeclared bean still sees beans built after it.
        if (!deps?.length && !optionalDeps?.length) {
            return source;
        }

        const view: Record<string, unknown> = {};
        for (const key of kernelKeys) {
            view[key] = source[key];
        }
        for (const dep of deps ?? []) {
            view[dep] = source[dep];
        }
        for (const dep of optionalDeps ?? []) {
            if (source[dep] !== undefined) {
                view[dep] = source[dep];
            }
        }
        view.context = scopedContext(view);
        return view;
    };

    const teardown = (started: readonly AgGraphBean<TBeans>[]): void => {
        destroyed = true;
        for (let i = started.length - 1; i >= 0; --i) {
            started[i].destroy?.();
        }
        for (const key of Object.keys(built)) {
            delete built[key];
        }
        all.clear();
        owned.clear();
        kernelBeans.clear();
        destroyCallback?.();
    };

    const destroyOne = (bean: AgBaseBean<TBeans> | null | undefined): void => {
        if (bean == null) {
            return;
        }
        const owner = owningGraph.get(bean);
        if (owner !== undefined && owner !== self) {
            const { beanName = '(runtime bean)' } = bean as Partial<AgDeclaredBean<TBeans>>;
            throw new Error(
                `AG Stack: '${beanName}' belongs to the ${owner.id} graph and cannot be destroyed by the ${id} graph.`
            );
        }
        bean.destroy?.();
    };

    const graph: AgBeanGraph<TBeans> = {
        beans: built as TBeans,
        order,
        instanceId: _nextContainerInstanceId(),
        getBeans: () => built as TBeans,
        getBean: (name) => (built as TBeans)[name],
        getId: () => id,
        isDestroyed: () => destroyed,
        createBean: (bean, afterPreCreateCallback) => createIn(built, bean, afterPreCreateCallback),
        destroyBean(bean) {
            destroyOne(bean);
            return undefined;
        },
        destroyBeans(list) {
            for (const bean of list ?? []) {
                destroyOne(bean);
            }
            return [];
        },
        destroy() {
            // A bean's own `destroy` can reach back here through `beans.context`.
            if (!destroyed) {
                teardown(order.map((name) => all.get(name)!));
            }
        },
    };

    built.context ??= graph;

    // Every bean is in the collection before any is wired, so a `wireBeans` finds its siblings whatever the order.
    for (const name of order) {
        built[name] = all.get(name);
    }

    const started: AgGraphBean<TBeans>[] = [];
    try {
        for (const name of order) {
            const bean = all.get(name)!;
            const view = viewFor(bean, built) as TBeans;
            started.push(bean);
            bean.preWireBeans?.(view);
            bean.wireBeans?.(view);
        }
        for (const name of order) {
            all.get(name)!.preConstruct?.();
        }
        for (const name of order) {
            all.get(name)!.postConstruct?.();
        }
    } catch (e) {
        // The caller never receives the graph, so nothing else can release these beans.
        teardown(started);
        throw e;
    }

    return graph;
}

/**
 * Depth-first topological sort. An optional dependency orders the graph when present but never
 * makes it unsatisfiable. A bean declaring nothing keeps its registered position.
 */
function sortTopologically<TBeans>(owned: Map<string, AgGraphBean<TBeans>>, id: string): string[] {
    const order: string[] = [];
    const settled = new Set<string>();
    const onPath = new Set<string>();

    const visit = (name: string, path: string[]): void => {
        if (settled.has(name)) {
            return;
        }
        if (onPath.has(name)) {
            const cycle = [...path.slice(path.indexOf(name)), name].join(' -> ');
            throw new Error(`AG Stack: the ${id} graph has a dependency cycle: ${cycle}.`);
        }
        const bean = owned.get(name);
        // Kernel members are already built, so they end the walk.
        if (bean == null) {
            return;
        }

        onPath.add(name);
        path.push(name);
        for (const dep of bean.deps ?? []) {
            visit(dep, path);
        }
        for (const dep of bean.optionalDeps ?? []) {
            visit(dep, path);
        }
        path.pop();
        onPath.delete(name);

        settled.add(name);
        order.push(name);
    };

    for (const name of owned.keys()) {
        visit(name, []);
    }
    return order;
}
