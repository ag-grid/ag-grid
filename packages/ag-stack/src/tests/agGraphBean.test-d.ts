import { describe, expectTypeOf, it } from 'vitest';

import type { AgDeclaredBean, AgGraphBean, AgUndeclaredBean } from '../core/agBeanGraph';

interface TestBeans {
    alpha: { beanName: 'alpha' };
    beta: { beanName: 'beta' };
}

// Assertions must sit inside `it`: with `ignoreSourceErrors`, module-scope errors go unchecked.
describe('what a graph will accept as a bean', () => {
    it('seals the hooks declared dependencies replace, on the declaring arm', () => {
        expectTypeOf<AgDeclaredBean<TestBeans>['wireBeans']>().toEqualTypeOf<undefined>();
        expectTypeOf<AgDeclaredBean<TestBeans>['preConstruct']>().toEqualTypeOf<undefined>();
    });

    it('leaves both hooks open to a bean that declares nothing', () => {
        expectTypeOf<AgUndeclaredBean<TestBeans>['wireBeans']>().toEqualTypeOf<
            ((beans: TestBeans) => void) | undefined
        >();
        expectTypeOf<AgUndeclaredBean<TestBeans>['preConstruct']>().toEqualTypeOf<(() => void) | undefined>();
    });

    it('accepts a declaring bean only for keys of its own collection', () => {
        expectTypeOf<AgDeclaredBean<TestBeans>['deps']>().toEqualTypeOf<readonly ('alpha' | 'beta')[] | undefined>();
    });

    it('admits a bean on exactly one arm', () => {
        const declaring = {
            beanName: 'x',
            deps: ['alpha'],
            postConstruct() {},
        } as const satisfies AgGraphBean<TestBeans>;
        expectTypeOf(declaring.deps).toEqualTypeOf<readonly ['alpha']>();

        const wiring = {
            beanName: 'y',
            wireBeans(_beans: TestBeans) {},
        } satisfies AgGraphBean<TestBeans>;
        expectTypeOf(wiring.beanName).toEqualTypeOf<string>();
    });

    it('takes its lifecycle from AgBaseBean rather than restating it', () => {
        expectTypeOf<AgGraphBean>().toHaveProperty('preWireBeans');
        expectTypeOf<AgGraphBean['postConstruct']>().toEqualTypeOf<(() => void) | undefined>();
        expectTypeOf<AgGraphBean['destroy']>().toEqualTypeOf<(() => void) | undefined>();
        expectTypeOf<AgGraphBean['beanName']>().toEqualTypeOf<string | undefined>();
    });
});
