import type { AgGraphBean } from './agBeanGraph';

type BeanClass<TBeans> = new () => AgGraphBean<TBeans>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgBeanSource<TBeans> {
    beans?: BeanClass<TBeans>[];
}

/**
 * Instantiates the beans a set of sources contribute, ready to hand to `createBeanGraph`.
 *
 * A later source registering an existing name replaces the earlier bean. `first` and `last` pin
 * beans that declare nothing to either end of the list; as destruction runs in reverse, `last`
 * also makes a bean the first destroyed.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function createBeanList<TBeans>(
    sources: readonly AgBeanSource<TBeans>[],
    first: readonly string[] = [],
    last: readonly string[] = []
): AgGraphBean<TBeans>[] {
    const byName = new Map<string, AgGraphBean<TBeans>>();
    for (const source of sources) {
        for (const BeanClass of source.beans ?? []) {
            const instance = new BeanClass();
            if (!instance.beanName) {
                // eslint-disable-next-line no-console
                console.error(`Bean ${BeanClass.name} is missing beanName`);
                continue;
            }
            byName.set(instance.beanName, instance);
        }
    }

    const take = (names: readonly string[]): AgGraphBean<TBeans>[] => {
        const taken: AgGraphBean<TBeans>[] = [];
        for (const name of names) {
            const instance = byName.get(name);
            if (instance !== undefined) {
                taken.push(instance);
                byName.delete(name);
            }
        }
        return taken;
    };

    const head = take(first);
    const tail = take(last);
    return [...head, ...byName.values(), ...tail];
}
