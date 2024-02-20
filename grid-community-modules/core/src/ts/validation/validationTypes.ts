import { GridOptions } from '../entities/gridOptions';
import { RowModelType } from '../interfaces/iRowModel';
import { ModuleNames } from '../modules/moduleNames';

export interface OptionsValidator<T extends {}> {
    objectName: string;
    allProperties?: string[];
    propertyExceptions?: string[];
    docsUrl?: `${string}/`,
    deprecations: Deprecations<T>;
    validations: Validations<T>;
}

// Deprecations, if renamed then old value is copied.
export type Deprecations<T extends {}> = Partial<{ [key in (keyof T)]: { version: string, message?: string } | { version: string, renamed: keyof T } }>;

// Util, if array, type of array. Else T.
type TypeOfArray<T> = NonNullable<T extends Array<infer U> ? U : T>;

// Validation rules, either sub-validator, function returning rules, or rules.
export type Validations<T extends {}> = Partial<{
    [key in (keyof T)]: (
        (TypeOfArray<T[key]> extends {} ? () => OptionsValidator<TypeOfArray<T[key]>> : never) |
        ((options: T, gridOptions: GridOptions) => OptionsValidation<T> | null) |
        OptionsValidation<T> |
        undefined
    )
}>;

// Rules object, if present, module is required.
export interface OptionsValidation<T extends {}> {
    module?: ModuleNames | ModuleNames[];
    supportedRowModels?: RowModelType[];
    dependencies?: DependencyValidator<T>;
}

export type DependencyValidator<T extends {}> =  RequiredOptions<T> | ((options: T, gridOptions: GridOptions) => string | null);

// Each property key requires one of the values in the array to also be present.
export type RequiredOptions<T extends {}> = { [K in keyof T]: T[K][] };

