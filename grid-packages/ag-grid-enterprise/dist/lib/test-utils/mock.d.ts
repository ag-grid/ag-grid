/// <reference types="jest" />
declare type GenericFunction = (...args: any[]) => any;
declare type PickByTypeKeyFilter<T, C> = {
    [K in keyof T]: T[K] extends C ? K : never;
};
declare type KeysByType<T, C> = PickByTypeKeyFilter<T, C>[keyof T];
declare type MethodsOf<T> = KeysByType<Required<T>, GenericFunction>;
export declare function mock<T>(...mockedMethods: MethodsOf<T>[]): jest.Mocked<T>;
export {};
