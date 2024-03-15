// TODO: ideally would use 'jest-mock-extended' but this requires TypeScript 3.7 - reintroduce after upgrade

/* Taken from https://github.com/facebook/jest/issues/7832#issuecomment-462343138 */
type GenericFunction = (...args: any[]) => any;

type PickByTypeKeyFilter<T, C> = {
    [K in keyof T]: T[K] extends C ? K : never
};

type KeysByType<T, C> = PickByTypeKeyFilter<T, C>[keyof T];

type ValuesByType<T, C> = {
    [K in keyof T]: T[K] extends C ? T[K] : never
};

type PickByType<T, C> = Pick<ValuesByType<T, C>, KeysByType<T, C>>;

type MethodsOf<T> = KeysByType<Required<T>, GenericFunction>;

type InterfaceOf<T> = PickByType<T, GenericFunction>;

type PartiallyMockedInterfaceOf<T> = {
    [K in MethodsOf<T>]?: jest.Mock<InterfaceOf<T>[K]>
};

export function mock<T>(...mockedMethods: MethodsOf<T>[]): jest.Mocked<T> {
    const partiallyMocked: PartiallyMockedInterfaceOf<T> = {};
    mockedMethods.forEach(mockedMethod => partiallyMocked[mockedMethod] = jest.fn());

    return partiallyMocked as jest.Mocked<T>;
}
