import type { GridOptions } from '../entities/gridOptions';
import type { ModuleName } from '../interfaces/iModule';
import type { RowModelType } from '../interfaces/iRowModel';

export interface OptionsValidator<T extends object> {
    objectName: string;
    allProperties?: string[];
    propertyExceptions?: string[];
    docsUrl?: `${string}/`;
    deprecations: Deprecations<T>;
    validations: Validations<T>;
}

// Deprecations, if renamed then old value is copied.
export type Deprecations<T extends object> = Partial<{
    [key in keyof T]: { version: string; message?: string } | { version: string; renamed: keyof T };
}>;

// Util, if array, type of array. Else T.
type TypeOfArray<T> = NonNullable<T extends Array<infer U> ? U : T>;

// Validation rules, either sub-validator, function returning rules, or rules.
export type Validations<T extends object> = Partial<{
    [key in keyof T]:
        | (TypeOfArray<T[key]> extends object ? () => OptionsValidator<TypeOfArray<T[key]>> : never)
        | ((options: T, gridOptions: GridOptions) => OptionsValidation<T> | null)
        | OptionsValidation<T>
        | undefined;
}>;

// Rules object, if present, module is required.
export interface OptionsValidation<T extends object> {
    module?: ModuleName | ModuleName[];
    supportedRowModels?: RowModelType[];
    dependencies?: RequiredOptions<T>;
    validate?: (options: T, gridOptions: GridOptions) => string | null;
}

// Each property key requires one of the values in the array to also be present.
export type DependentValues<T extends object, K extends keyof T> = { required: T[K][]; reason?: string };
export type RequiredOptions<T extends object> = { [K in keyof T]: DependentValues<T, K> };
