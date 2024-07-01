import type { GridOptions } from '../entities/gridOptions';
import type { RowModelType } from '../interfaces/iRowModel';
import type { ModuleNames } from '../modules/moduleNames';
export interface OptionsValidator<T extends object> {
    objectName: string;
    allProperties?: string[];
    propertyExceptions?: string[];
    docsUrl?: `${string}/`;
    deprecations: Deprecations<T>;
    validations: Validations<T>;
}
export type Deprecations<T extends object> = Partial<{
    [key in keyof T]: {
        version: string;
        message?: string;
    } | {
        version: string;
        renamed: keyof T;
    };
}>;
type TypeOfArray<T> = NonNullable<T extends Array<infer U> ? U : T>;
export type Validations<T extends object> = Partial<{
    [key in keyof T]: (TypeOfArray<T[key]> extends object ? () => OptionsValidator<TypeOfArray<T[key]>> : never) | ((options: T, gridOptions: GridOptions) => OptionsValidation<T> | null) | OptionsValidation<T> | undefined;
}>;
export interface OptionsValidation<T extends object> {
    module?: ModuleNames | ModuleNames[];
    supportedRowModels?: RowModelType[];
    dependencies?: DependencyValidator<T>;
}
export type DependencyValidator<T extends object> = RequiredOptions<T> | ((options: T, gridOptions: GridOptions) => string | null);
export type RequiredOptions<T extends object> = {
    [K in keyof T]: T[K][];
};
export {};
