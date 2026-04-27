import type { Mock, Mocked } from 'vitest';

type GenericFunction = (...args: any[]) => any;

type PickByTypeKeyFilter<T, C> = {
    [K in keyof T]: T[K] extends C ? K : never;
};

type KeysByType<T, C> = PickByTypeKeyFilter<T, C>[keyof T];

type ValuesByType<T, C> = {
    [K in keyof T]: T[K] extends C ? T[K] : never;
};

type PickByType<T, C> = Pick<ValuesByType<T, C>, KeysByType<T, C>>;

type MethodsOf<T> = KeysByType<Required<T>, GenericFunction>;

type InterfaceOf<T> = PickByType<T, GenericFunction>;

type PartiallyMockedInterfaceOf<T> = {
    [K in MethodsOf<T>]?: Mock<InterfaceOf<T>[K]>;
};

export function mock<T>(...mockedMethods: MethodsOf<T>[]): Mocked<T> {
    const partiallyMocked: PartiallyMockedInterfaceOf<T> = {};
    for (const mockedMethod of mockedMethods) {
        partiallyMocked[mockedMethod] = vi.fn();
    }

    return partiallyMocked as Mocked<T>;
}
