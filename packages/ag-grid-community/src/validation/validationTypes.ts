import type { BeanCollection } from '../context/context';
import type { GridOptions } from '../entities/gridOptions';
import type { ValidationModuleName } from '../interfaces/iModule';
import type { RowModelType } from '../interfaces/iRowModel';
import type { ErrorId, GetErrorParams } from './errorMessages/errorText';
import type { LogService } from './logService';

/**
 * A validation result that resolves to a first-class error id (so it is captured by the diagnostic
 * overlay and throw mode), rather than a free-text message. Build via {@link _createValidationWarning}.
 * `emit` is captured at construction, where the id/params pairing is concrete.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface ValidationWarning {
    errorId: ErrorId;
    /** Emit through the emitting grid's log service, so the diagnostic is attributed to that grid. */
    emit: (log: LogService) => void;
}

// Routes a validation diagnostic through the grid-scoped log service so it is attributed to the emitting
// grid. The cast only erases the variadic-overload conditional, which TS cannot resolve for a still-generic id.
function emitValidation(log: LogService, id: ErrorId, params: unknown, deprecation: boolean): void {
    if (deprecation) {
        (log.deprecated as (id: ErrorId, params: unknown) => void)(id, params);
    } else {
        (log.warn as (id: ErrorId, params: unknown) => void)(id, params);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createValidationWarning<TId extends ErrorId>(
    errorId: TId,
    params: GetErrorParams<TId>
): ValidationWarning {
    return { errorId, emit: (log) => emitValidation(log, errorId, params, false) };
}

/**
 * As {@link _createValidationWarning}, but the diagnostic is captured as a deprecation (see {@link _deprecated}).
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _createDeprecationWarning<TId extends ErrorId>(
    errorId: TId,
    params: GetErrorParams<TId>
): ValidationWarning {
    return { errorId, emit: (log) => emitValidation(log, errorId, params, true) };
}

/**
 * Emits a validation result that may be either a first-class {@link ValidationWarning} or a legacy
 * free-text string (logged under the generic id 322), through the emitting grid's log service so the
 * diagnostic is attributed to that grid.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _emitValidationWarning(warning: string | ValidationWarning, log: LogService): void {
    if (typeof warning === 'string') {
        emitValidation(log, 322, { message: warning }, false);
    } else {
        warning.emit(log);
    }
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
