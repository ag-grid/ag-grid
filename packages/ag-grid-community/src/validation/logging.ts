import { BASE_URL } from '../baseUrl';
import { _isUmd } from '../modules/moduleRegistry';
import { _errorOnce, _warnOnce } from '../utils/log';
import { VERSION } from '../version';
import type { ErrorId, ErrorMap, GetErrorParams } from './errorMessages/errorText';

const MAX_URL_LENGTH = 2000;
const MIN_PARAM_LENGTH = 100;
const VERSION_PARAM_NAME = '_version_';

let getConsoleMessage: (<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>) => any[]) | null = null;
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

/** Set by the Framework override to give us accurate links for the framework  */
export function setValidationDocLink(docLink: string) {
    baseDocLink = docLink;
}

type Severity = 'error' | 'warning' | 'deprecation';

// Inclusive throw ordering: throwOn a given level fires on that level and every more-severe one.
const SEVERITY_ORDER: Record<Severity, number> = { deprecation: 1, warning: 2, error: 3 };

/**
 * A diagnostic captured for the developer error overlay (config errors, runtime errors and warnings).
 * @knipIgnore Used in tests
 */
export interface OverlayError {
    id: ErrorId;
    params: any;
    severity: Severity;
    /** Fallback message used when the ValidationModule is not registered to supply the full text. */
    defaultMessage?: string;
}

type ErrorListener = (error: OverlayError) => void;

const errorListeners = new Set<ErrorListener>();

/**
 * Diagnostics fired before any listener attached are buffered and replayed to each new listener, so
 * the error overlay surfaces them too: a grid's OverlayService listener registers during bean init,
 * after earlier beans (e.g. GridOptionsService) may already have logged. Capped to bound memory on
 * long-lived pages.
 */
const bufferedErrors: OverlayError[] = [];
const MAX_BUFFERED_ERRORS = 100;

// Both default off so that without the ValidationModule (i.e. production) each log call is two boolean
// checks and no allocation. The ValidationModule turns them on at registration, before any grid exists.
let captureEnabled = false;
let throwThreshold: Severity | false = false;

/**
 * Pushed in by the ValidationModule (which core never imports) to enable diagnostic capture and/or the
 * throw threshold, mirroring the provideValidationServiceLogger setter idiom to keep the dependency
 * direction one-way.
 */
export function _configureDiagnostics(config: { capture?: boolean; throwOn?: Severity | false }): void {
    if (config.capture !== undefined) {
        captureEnabled = config.capture;
    }
    if (config.throwOn !== undefined) {
        throwThreshold = config.throwOn;
    }
}

/**
 * Registers a listener notified of every captured error/warning, used by the error overlay. Any
 * diagnostics already buffered (logged before this listener attached) are replayed to it immediately.
 * Returns a cleanup function that removes the listener and, once the last listener detaches, drops the
 * buffer so a later grid does not inherit stale diagnostics.
 * @knipIgnore Used in tests
 */
export function _addErrorListener(listener: ErrorListener): () => void {
    errorListeners.add(listener);
    for (let i = 0, len = bufferedErrors.length; i < len; ++i) {
        listener(bufferedErrors[i]);
    }
    return () => {
        errorListeners.delete(listener);
        if (errorListeners.size === 0) {
            bufferedErrors.length = 0;
        }
    };
}

function emitDiagnostic(id: ErrorId, params: any, severity: Severity, defaultMessage?: string): void {
    if (captureEnabled) {
        const error: OverlayError = { id, params, severity, defaultMessage };
        if (bufferedErrors.length < MAX_BUFFERED_ERRORS) {
            bufferedErrors.push(error);
        }
        for (const listener of errorListeners) {
            listener(error);
        }
    }
    const meetsThreshold = throwThreshold !== false && SEVERITY_ORDER[severity] >= SEVERITY_ORDER[throwThreshold];
    if (meetsThreshold) {
        throw new Error(`${severity} #${id} ` + getErrorParts(id, params, defaultMessage).join(' '));
    }
}

type LogFn = (message: string, ...args: any[]) => void;

function getErrorParts<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>, defaultMessage?: string): any[] {
    return getConsoleMessage?.(id, args) ?? [minifiedLog(id, args, defaultMessage)];
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
    emitDiagnostic(args[0], args[1] as any, 'warning');
}

/**
 * Logs at warning level (console) but captures the diagnostic as a deprecation, so the overlay can
 * group it and `throwOn: 'deprecation'` can target it.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _deprecated<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    getMsgOrDefault(_warnOnce, args[0], args[1] as any, true);
    emitDiagnostic(args[0], args[1] as any, 'deprecation');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _error<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    getMsgOrDefault(_errorOnce, args[0], args[1] as any, false);
    emitDiagnostic(args[0], args[1] as any, 'error');
}

/** Used for messages before the ValidationService has been created */
export function _logPreInitErr<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>, defaultMessage: string) {
    getMsgOrDefault(_errorOnce, id, args as any, false, defaultMessage);
    emitDiagnostic(id, args as any, 'error', defaultMessage);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _logPreInitWarn<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>, defaultMessage: string) {
    getMsgOrDefault(_warnOnce, id, args as any, true, defaultMessage);
    emitDiagnostic(id, args as any, 'warning', defaultMessage);
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
