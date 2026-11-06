import { describe, expectTypeOf, it } from 'vitest';

import { AgAbstractBean } from '../core/agAbstractBean';

interface Props {
    mode?: string;
}
interface Events {
    changed: { type: 'changed' };
}
type PropsSvc = {
    readonly beanName: 'gos';
    get<K extends keyof Props & string>(property: K): Props[K];
    addPropertyEventListener(event: never, listener: never): void;
    removePropertyEventListener(event: never, listener: never): void;
    addPropertiesChangedListener(listener: never): void;
    removePropertiesChangedListener(listener: never): void;
};
interface Beans {
    context: never;
    eventSvc: never;
    frameworkOverrides: never;
    gos: PropsSvc;
    alpha: { value: string };
    beta: { other: number };
    gamma: { flag: boolean };
}

class Undeclared extends AgAbstractBean<Beans, Props, Events, PropsSvc> {}

class Declared extends AgAbstractBean<
    Beans,
    Props,
    Events,
    PropsSvc,
    'destroyed',
    readonly ['alpha'],
    readonly ['gamma']
> {
    override readonly deps = ['alpha'] as const;
    override readonly optionalDeps = ['gamma'] as const;
}

// Assertions must sit inside `it`: with `ignoreSourceErrors`, module-scope errors go unchecked.
describe('what a bean can reach', () => {
    it('is the whole collection when it declares nothing', () => {
        expectTypeOf<Undeclared['beans']>().toHaveProperty('alpha');
        expectTypeOf<Undeclared['beans']>().toHaveProperty('beta');
    });

    it('is only what it declared once it declares anything', () => {
        expectTypeOf<Declared['beans']>().toHaveProperty('alpha');
        expectTypeOf<Declared['beans']>().toHaveProperty('gamma');
        expectTypeOf<Declared['beans']>().not.toHaveProperty('beta');
    });

    it('keeps the ambient beans the base wires itself from', () => {
        expectTypeOf<Declared['beans']>().toHaveProperty('gos');
        expectTypeOf<Declared['beans']>().toHaveProperty('eventSvc');
        expectTypeOf<Declared['beans']>().toHaveProperty('context');
    });

    it('makes an optional dep optional and a required one not', () => {
        expectTypeOf<Declared['beans']['gamma']>().toEqualTypeOf<{ flag: boolean } | undefined>();
        expectTypeOf<Declared['beans']['alpha']>().not.toEqualTypeOf<{ value: string } | undefined>();
    });
});
