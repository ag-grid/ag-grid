import { BASE_URL } from '../baseUrl';
import { _isUmd } from '../modules/moduleRegistry';
import { _errorOnce, _warnOnce } from '../utils/log';
import { VERSION } from '../version';
import type { ErrorId, ErrorMap, GetErrorParams } from './errorMessages/errorText';

const MAX_URL_LENGTH = 2000;
const MIN_PARAM_LENGTH = 100;
const VERSION_PARAM_NAME = '_version_';

let getConsoleMessage: (<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>) => any[]) | null = null;
let getModuleErrorMessage: (<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>) => any[] | null) | null = null;
export let baseDocLink = `${BASE_URL}/javascript-data-grid`;
/**
 * The ValidationService passes itself in if it has been included.
 * @param logger
 */
export function provideValidationServiceLogger(
    logger: <TId extends ErrorId>(id: TId, args: GetErrorParams<TId>) => any[]
) {
    getConsoleMessage = logger;
}

/**
 * Resolver for module-registration errors, wired unconditionally by core. Returns the full message
 * for the module-family errors (and null for everything else) so that "register XModule" guidance is
 * always actionable in the console - even when the ValidationModule, which provides the full text for
 * all other errors, has not been registered. The error overlay shows this guidance only when no modules
 * have been registered at all (the bootstrap case); otherwise overlay rendering is tied to the ValidationModule.
 */
export function provideModuleErrorLogger(
    logger: <TId extends ErrorId>(id: TId, args: GetErrorParams<TId>) => any[] | null
) {
    getModuleErrorMessage = logger;
}

/** Set by the Framework override to give us accurate links for the framework  */
export function setValidationDocLink(docLink: string) {
    baseDocLink = docLink;
}

/** An error captured for display in the developer error overlay (pre-init config errors and runtime errors). */
export interface OverlayError {
    id: ErrorId;
    params: any;
    /** Pre-init fallback message used when the ValidationModule is not registered. Runtime errors derive it on demand. */
    defaultMessage?: string;
}

type ErrorListener = (id: ErrorId, params: any) => void;

/**
 * Builds the DOM for a single captured error in the error overlay. Provided by the ValidationModule so
 * the rich rendering (code blocks, inline code, links, copy) is only bundled when that module is registered.
 */
type OverlayErrorRenderer = (error: OverlayError) => HTMLElement;

let overlayErrorRenderer: OverlayErrorRenderer | null = null;

/** Registered by the ValidationModule to supply the rich per-error overlay rendering. */
export function provideOverlayErrorRenderer(renderer: OverlayErrorRenderer): void {
    overlayErrorRenderer = renderer;
}

/** The rich per-error overlay renderer, or null when the ValidationModule is not registered. */
export function _getOverlayErrorRenderer(): OverlayErrorRenderer | null {
    return overlayErrorRenderer;
}

/** True for module-registration errors, whose full guidance is wired unconditionally by core. */
export function _isModuleError(id: ErrorId, params: any): boolean {
    return getModuleErrorMessage?.(id, params) != null;
}

/** The resolved error message as a single string, used by the overlay renderer to build its DOM. */
export function _getRawErrorMessage(id: ErrorId, params: any, defaultMessage?: string): string {
    return getErrorParts(id, params, defaultMessage).map(stringifyValue).join(' ');
}

const errorListeners = new Set<ErrorListener>();

/**
 * Errors fired before any listener attached are buffered and replayed to each new listener, so the
 * error overlay surfaces them too. A grid's OverlayService listener registers during bean init, after
 * earlier beans (e.g. GridOptionsService) may already have validated options and logged errors. The
 * buffer is capped to bound memory on long-lived pages; per-grid filtering happens in the listener.
 */
const bufferedErrors: { id: ErrorId; params: any }[] = [];
const MAX_BUFFERED_ERRORS = 100;

/**
 * Registers a listener notified of every `_error` call, used by the error overlay to surface errors.
 * Any errors already buffered (logged before this listener attached) are replayed to it immediately.
 * Returns a cleanup function that removes the listener.
 */
export function _addErrorListener(listener: ErrorListener): () => void {
    errorListeners.add(listener);
    for (let i = 0, len = bufferedErrors.length; i < len; ++i) {
        listener(bufferedErrors[i].id, bufferedErrors[i].params);
    }
    return () => {
        errorListeners.delete(listener);
        // Once every grid has gone, drop the buffer so a later grid does not inherit stale errors.
        if (errorListeners.size === 0) {
            bufferedErrors.length = 0;
        }
    };
}

type LogFn = (message: string, ...args: any[]) => void;

function getErrorParts<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>, defaultMessage?: string): any[] {
    return (
        getConsoleMessage?.(id, args) ?? getModuleErrorMessage?.(id, args) ?? [minifiedLog(id, args, defaultMessage)]
    );
}

function getMsgOrDefault<TId extends ErrorId>(
    logger: LogFn,
    id: TId,
    args: GetErrorParams<TId>,
    isWarning: boolean,
    defaultMessage?: string
) {
    logger(`${isWarning ? 'warning' : 'error'} #${id}`, ...getErrorParts(id, args, defaultMessage));
}

/**
 * Stringify object, removing any circular dependencies
 */
function stringifyObject(inputObj: any) {
    if (!inputObj) {
        return String(inputObj);
    }
    const object: Record<string, any> = {};
    for (const prop of Object.keys(inputObj)) {
        if (typeof inputObj[prop] !== 'object' && typeof inputObj[prop] !== 'function') {
            object[prop] = inputObj[prop];
        }
    }
    return JSON.stringify(object);
}

function stringifyValue(value: any) {
    let output = value;
    if (value instanceof Error) {
        output = value.toString();
    } else if (typeof value === 'object') {
        output = stringifyObject(value);
    }
    return output;
}
/**
 * Correctly formats a string or undefined or null value into a human readable string
 * @param input
 */
export function toStringWithNullUndefined(str: string | null | undefined) {
    return str === undefined ? 'undefined' : str === null ? 'null' : str;
}

function getParamsUrl(baseUrl: string, params: URLSearchParams) {
    return `${baseUrl}?${params.toString()}`;
}

function truncateUrl(baseUrl: string, params: URLSearchParams, maxLength: number) {
    const sortedParams = Array.from(params.entries()).sort((a, b) => b[1].length - a[1].length);
    let url = getParamsUrl(baseUrl, params);

    for (const [key, value] of sortedParams) {
        if (key === VERSION_PARAM_NAME) {
            continue;
        }
        const excessLength = url.length - maxLength;
        if (excessLength <= 0) {
            break;
        }

        const ellipse = '...';
        const truncateAmount = excessLength + ellipse.length;
        // Truncate by `truncateAmount`, unless the result is shorter than the min param
        // length. In which case, shorten to min param length, then continue shortening
        // other params.
        // Assume there isn't a lot of params that are all long.
        const truncatedValue =
            value.length - truncateAmount > MIN_PARAM_LENGTH
                ? value.slice(0, value.length - truncateAmount) + ellipse
                : value.slice(0, MIN_PARAM_LENGTH) + ellipse;

        params.set(key, truncatedValue);
        url = getParamsUrl(baseUrl, params);
    }

    return url;
}

export function getErrorLink(errorNum: ErrorId, args: GetErrorParams<any>) {
    const params = new URLSearchParams();
    params.append(VERSION_PARAM_NAME, VERSION);
    if (args) {
        for (const key of Object.keys(args)) {
            params.append(key, stringifyValue(args[key]));
        }
    }
    const baseUrl = `${baseDocLink}/errors/${errorNum}`;
    const url = getParamsUrl(baseUrl, params);

    return url.length <= MAX_URL_LENGTH ? url : truncateUrl(baseUrl, params, MAX_URL_LENGTH);
}

const minifiedLog = (errorNum: ErrorId, args: GetErrorParams<any>, defaultMessage?: string) => {
    const errorLink = getErrorLink(errorNum, args);

    const prefix = `${defaultMessage ? defaultMessage + ' \n' : ''}Visit ${errorLink}`;
    if (_isUmd()) {
        return prefix;
    }
    return `${prefix}${defaultMessage ? '' : ' \n  Alternatively register the ValidationModule to see the full message in the console.'}`;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _warn<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    getMsgOrDefault(_warnOnce, args[0], args[1] as any, true);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _error<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    getMsgOrDefault(_errorOnce, args[0], args[1] as any, false);
    if (bufferedErrors.length < MAX_BUFFERED_ERRORS) {
        bufferedErrors.push({ id: args[0], params: args[1] });
    }
    if (errorListeners.size) {
        for (const listener of errorListeners) {
            listener(args[0], args[1]);
        }
    }
}

/** Used for messages before the ValidationService has been created */
export function _logPreInitErr<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>, defaultMessage: string) {
    getMsgOrDefault(_errorOnce, id, args as any, false, defaultMessage);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _logPreInitWarn<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>, defaultMessage: string) {
    getMsgOrDefault(_warnOnce, id, args as any, true, defaultMessage);
}

function getErrMsg<TId extends ErrorId>(
    defaultMessage: string | undefined,
    args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]
): string {
    const id = args[0];
    return `error #${id} ` + getErrorParts(id, args[1] as any, defaultMessage).join(' ');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _errMsg<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): string {
    return getErrMsg(undefined, args);
}

/**
 * Used for messages before the ValidationService has been created
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _preInitErrMsg<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): string {
    // as well as displaying an extra line break, this will remove the part of the message about adding the validation module
    return getErrMsg('\n', args);
}
