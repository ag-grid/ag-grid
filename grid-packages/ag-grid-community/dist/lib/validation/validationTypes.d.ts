import { GridOptions } from '../entities/gridOptions';
import { RowModelType } from '../interfaces/iRowModel';
import { ModuleNames } from '../modules/moduleNames';
export interface OptionsValidator<T extends {}> {
    objectName: string;
    allProperties?: string[];
    propertyExceptions?: string[];
    docsUrl?: `${string}/`;
    deprecations: Deprecations<T>;
    validations: Validations<T>;
}
export declare type Deprecations<T extends {}> = Partial<{
    [key in (keyof T)]: {
        version: string;
        message?: string;
    } | {
        version: string;
        renamed: keyof T;
    };
}>;
declare type TypeOfArray<T> = NonNullable<T extends Array<infer U> ? U : T>;
export declare type Validations<T extends {}> = Partial<{
    [key in (keyof T)]: ((TypeOfArray<T[key]> extends {} ? () => OptionsValidator<TypeOfArray<T[key]>> : never) | ((options: T, gridOptions: GridOptions) => OptionsValidation<T> | null) | OptionsValidation<T> | undefined);
}>;
export interface OptionsValidation<T extends {}> {
    module?: ModuleNames | ModuleNames[];
    supportedRowModels?: RowModelType[];
    dependencies?: DependencyValidator<T>;
}
export declare type DependencyValidator<T extends {}> = RequiredOptions<T> | ((options: T, gridOptions: GridOptions) => string | null);
export declare type RequiredOptions<T extends {}> = {
    [K in keyof T]: T[K][];
};
export {};
