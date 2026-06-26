import type { BeanCollection } from '../context/context';
import type { GridOptions } from '../entities/gridOptions';
import type { ValidationModuleName } from '../interfaces/iModule';
import type { RowModelType } from '../interfaces/iRowModel';
import type { ErrorId, GetErrorParams } from './errorMessages/errorText';
import { _warn } from './logging';

/**
 * A validation result that resolves to a first-class error id (so it is captured by the diagnostic
 * overlay and throw mode), rather than a free-text message. Build via {@link validationWarning}.
 * `emit` is captured at construction, where the id/params pairing is concrete.
 */
export interface ValidationWarning {
    errorId: ErrorId;
    emit: () => void;
}

export function validationWarning<TId extends ErrorId>(errorId: TId, params: GetErrorParams<TId>): ValidationWarning {
    // params is bound to errorId by this signature; the cast only erases _warn's variadic-overload
    // conditional, which TS cannot resolve for a still-generic id.
    return { errorId, emit: () => (_warn as (id: ErrorId, params: unknown) => void)(errorId, params) };
}

// Vue adds these properties to all objects, so we ignore them when checking for invalid properties
const VUE_FRAMEWORK_PROPS = ['__ob__', '__v_skip', '__metadata__'];

/** Build the set of all property names that should be accepted without warning. */
export function buildAllValidNames<T extends object>(
    allProperties: string[],
    deprecations: Deprecations<T>,
    propertyExceptions?: string[]
): Set<string> {
    return new Set([
        ...VUE_FRAMEWORK_PROPS,
        ...(propertyExceptions ?? []),
        ...Object.keys(deprecations),
        ...allProperties,
    ]);
}

export interface OptionsValidator<T extends object> {
    objectName: string;
    allProperties: string[];
    /** Pre-computed set of all accepted property names (valid + deprecated + exceptions + Vue). */
    allValidNames: Set<string>;
    docsUrl?: `${string}/`;
    deprecations: Deprecations<T>;
    validations: Validations<T>;
}

export type Deprecations<T extends object> = Partial<{
    [key in keyof T]: { version: string; message?: string };
}>;

type GetRequiredModule<T extends object> = (
    options: T,
    gridOptions: GridOptions,
    beans: BeanCollection
) => ValidationModuleName | ValidationModuleName[] | null;

export type RequiredModule<T extends object> = GetRequiredModule<T> | ValidationModuleName | ValidationModuleName[];

export type ModuleValidation<T extends object> = {
    [key in keyof T]?: RequiredModule<T>;
};

// Validation rules, either sub-validator, function returning rules, or rules.
export type Validations<T extends object> = {
    [key in keyof T]?: OptionsValidation<T>;
};

// Rules object, if present, module is required.
interface OptionsValidation<T extends object> {
    supportedRowModels?: RowModelType[];
    dependencies?: RequiredOptions<T>;
    validate?: (options: T, gridOptions: GridOptions, beans: BeanCollection) => string | ValidationWarning | null;
    /** Currently only supports boolean or number */
    expectedType?: 'boolean' | 'number';
}

// Each property key requires one of the values in the array to also be present.
export type DependentValues<T extends object, K extends keyof T> = { required: T[K][]; reason?: string };
export type RequiredOptions<T extends object> = { [K in keyof T]: DependentValues<T, K> };
