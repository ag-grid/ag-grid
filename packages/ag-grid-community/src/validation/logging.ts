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

export type Severity = 'error' | 'warning' | 'deprecation';

export type SeverityThreshold = Severity | 'none';

// Inclusive severity ordering: a threshold fires on that level and every more-severe one.
const SEVERITY_ORDER: Record<Severity, number> = { deprecation: 1, warning: 2, error: 3 };

/**
 * Whether `severity` meets an inclusive `threshold`: true when it is at least as severe. A `'none'`
 * threshold matches nothing. Shared by the throw-on check and the overlay's severity filter so both
 * honour the same graded model.
 */
export function _meetsSeverityThreshold(severity: Severity, threshold: SeverityThreshold): boolean {
    return threshold !== 'none' && SEVERITY_ORDER[severity] >= SEVERITY_ORDER[threshold];
}

/**
 * A diagnostic captured for the developer overlay (config errors, runtime errors and warnings).
 */
export interface CapturedDiagnostic {
    id: ErrorId;
    params: any;
    severity: Severity;
    /**
     * The grid that emitted this, so a listener surfaces only its own grid's diagnostics. Set when the
     * emitting bean routes through its grid-scoped log service (or an explicit grid id is threaded in),
     * and undefined when emitted outside any grid (e.g. a bootstrap failure, or a standalone export).
     */
    gridId?: string;
    /** Fallback message used when the ValidationModule is not registered to supply the full text. */
    defaultMessage?: string;
}

/**
 * Stable identity key for deduping captured diagnostics: the same `id` and `params` yield the same key.
 * Non-serialisable params (functions, circular refs) fall back to `${id}:unserialisable:${fallbackSeed}`
 * so distinct entries are never collapsed — callers pass a per-call seed (a counter or index) for this.
 */
export function _diagnosticKey(diagnostic: CapturedDiagnostic, fallbackSeed: string | number): string {
    const { id, params } = diagnostic;
    if (params == null) {
        return `${id}`;
    }
    try {
        return `${id}:${JSON.stringify(params)}`;
    } catch {
        return `${id}:unserialisable:${fallbackSeed}`;
    }
}

type DiagnosticListener = (diagnostic: CapturedDiagnostic) => void;

interface DiagnosticListenerEntry {
    gridId: string | undefined;
    listener: DiagnosticListener;
}

const diagnosticListeners = new Set<DiagnosticListenerEntry>();

// Whether a diagnostic from `diagnosticGridId` should be delivered to a listener bound to
// `listenerGridId`. A listener bound to no grid sees every diagnostic (a page-level panel); a grid's
// listener sees its own diagnostics plus any not tied to a grid (e.g. bootstrap failures).
function shouldNotify(diagnosticGridId: string | undefined, listenerGridId: string | undefined): boolean {
    return listenerGridId === undefined || diagnosticGridId === undefined || diagnosticGridId === listenerGridId;
}

/**
 * Diagnostics fired before any listener attaches are buffered here and replayed to each new listener, so
 * the overlay still surfaces them. This matters because a grid's OverlayService listener only registers
 * partway through bean init — earlier beans (e.g. GridOptionsService) may already have logged by then.
 * The buffer is capped to bound memory on long-lived pages.
 */
const bufferedDiagnostics: CapturedDiagnostic[] = [];
const MAX_BUFFERED_DIAGNOSTICS = 100;

// Both default off so that without the ValidationModule (i.e. production) each log call is two boolean
// checks and no allocation. The ValidationModule turns them on at registration, before any grid exists.
let captureEnabled = false;
let throwThreshold: SeverityThreshold = 'none';
// Error ids the developer has chosen to ignore: kept out of the overlay and never thrown in throw mode.
// The console log still fires — suppression only affects the dev-diagnostics surfaces, not the base logger.
let suppressedIds = new Set<ErrorId>();

/**
 * Called by the ValidationModule to enable diagnostic capture and set the throw threshold and/or the
 * suppressed ids. Core never imports the ValidationModule, so its config is pushed in through this setter
 * (the same idiom as `provideValidationServiceLogger`) to keep the dependency direction one-way.
 */
export function _configureDiagnostics(config: {
    capture?: boolean;
    throwOn?: SeverityThreshold;
    suppress?: ErrorId[];
}): void {
    if (config.capture !== undefined) {
        captureEnabled = config.capture;
    }
    if (config.throwOn !== undefined) {
        throwThreshold = config.throwOn;
    }
    if (config.suppress !== undefined) {
        suppressedIds = new Set(config.suppress);
    }
}

/**
 * Registers a listener notified of captured diagnostics for `gridId` (plus any not tied to a grid),
 * used by the error overlay. Pass `gridId: undefined` for a page-level listener that sees everything.
 * Diagnostics already buffered before it attached (and matching it) are replayed immediately. Returns
 * a cleanup function that removes the listener and, once the last listener detaches, drops the buffer
 * so a later grid does not inherit stale diagnostics.
 */
export function _addDiagnosticListener(gridId: string | undefined, listener: DiagnosticListener): () => void {
    const entry: DiagnosticListenerEntry = { gridId, listener };
    diagnosticListeners.add(entry);
    for (let i = 0, len = bufferedDiagnostics.length; i < len; ++i) {
        const diagnostic = bufferedDiagnostics[i];
        if (shouldNotify(diagnostic.gridId, gridId)) {
            listener(diagnostic);
        }
    }
    return () => {
        diagnosticListeners.delete(entry);
        if (diagnosticListeners.size === 0) {
            bufferedDiagnostics.length = 0;
        }
    };
}

type BootstrapPanelRenderer = (container: HTMLElement, diagnostics: CapturedDiagnostic[]) => void;
let bootstrapPanelRenderer: BootstrapPanelRenderer | null = null;

/**
 * Pushed in by the ValidationModule (which core never imports) to render a standalone panel of
 * bootstrap-failure diagnostics, for when grid creation aborts before any bean — and thus the overlay —
 * exists. Mirrors the provideValidationServiceLogger setter idiom to keep the dependency direction one-way.
 */
export function _provideBootstrapPanelRenderer(renderer: BootstrapPanelRenderer): void {
    bootstrapPanelRenderer = renderer;
}

/**
 * Renders the buffered diagnostics not tied to a grid (e.g. a missing row-model module that aborts grid
 * creation) into `container`, when the ValidationModule has provided a renderer. No-op otherwise, so core
 * stays decoupled and production pays nothing.
 */
export function _renderBootstrapPanel(container: HTMLElement): void {
    if (!bootstrapPanelRenderer) {
        return;
    }
    const untied: CapturedDiagnostic[] = [];
    for (let i = 0, len = bufferedDiagnostics.length; i < len; ++i) {
        if (bufferedDiagnostics[i].gridId === undefined) {
            untied.push(bufferedDiagnostics[i]);
        }
    }
    if (untied.length === 0) {
        return;
    }
    // Consume the rendered diagnostics so a re-created grid (e.g. React's dev/StrictMode double-invoke,
    // which aborts again with a fresh gridId) renders only its own failure rather than stacking them.
    for (let i = bufferedDiagnostics.length - 1; i >= 0; --i) {
        if (bufferedDiagnostics[i].gridId === undefined) {
            bufferedDiagnostics.splice(i, 1);
        }
    }
    bootstrapPanelRenderer(container, untied);
}

function emitDiagnostic(id: ErrorId, params: any, severity: Severity, defaultMessage?: string, gridId?: string): void {
    // Suppressed ids are omitted from the overlay and never throw; the console log has already fired.
    if (suppressedIds.has(id)) {
        return;
    }
    if (captureEnabled) {
        // gridId is supplied by the grid-scoped LogService; a diagnostic emitted through a free function
        // (pre-init, or a grid-less util) is undefined here and delivered to every listener.
        const diagnostic: CapturedDiagnostic = { id, params, severity, gridId, defaultMessage };
        if (bufferedDiagnostics.length < MAX_BUFFERED_DIAGNOSTICS) {
            bufferedDiagnostics.push(diagnostic);
        }
        for (const entry of diagnosticListeners) {
            if (shouldNotify(gridId, entry.gridId)) {
                entry.listener(diagnostic);
            }
        }
    }
    if (_meetsSeverityThreshold(severity, throwThreshold)) {
        throw new Error(`${severity} #${id} ` + getErrorParts(id, params, defaultMessage).join(' '));
    }
}

/**
 * Shared body for the log functions: fires the console message and captures the diagnostic. `gridId`
 * attributes the captured diagnostic to a specific grid (passed by the grid-scoped `LogService`);
 * omitted for the stateless free functions, whose diagnostics are captured untied.
 */
function logDiagnostic(
    logger: LogFn,
    id: ErrorId,
    params: any,
    severity: Severity,
    isWarning: boolean,
    gridId?: string
): void {
    logToConsole(logger, id, params, isWarning);
    emitDiagnostic(id, params, severity, undefined, gridId);
}

type LogFn = (message: string, ...args: any[]) => void;

function getErrorParts<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>, defaultMessage?: string): any[] {
    return getConsoleMessage?.(id, args) ?? [minifiedLog(id, args, defaultMessage)];
}

function logToConsole<TId extends ErrorId>(
    logger: LogFn,
    id: TId,
    args: GetErrorParams<TId>,
    isWarning: boolean,
    defaultMessage?: string
) {
    logger(`${isWarning ? 'warning' : 'error'} #${id}`, ...getErrorParts(id, args, defaultMessage));
}

function isPrimitive(value: any): boolean {
    return typeof value !== 'object' && typeof value !== 'function';
}

/**
 * Stringify object as JSON, keeping only primitive-valued properties so nested objects/functions (and
 * thus circular references) are never traversed. The reconstructed object is decoded on the error page.
 */
function stringifyObject(inputObj: any) {
    if (!inputObj) {
        return String(inputObj);
    }
    const object: Record<string, any> = {};
    for (const prop of Object.keys(inputObj)) {
        if (isPrimitive(inputObj[prop])) {
            object[prop] = inputObj[prop];
        }
    }
    return JSON.stringify(object);
}

/**
 * Stringify array as JSON, keeping only primitive elements (same circular-safety rationale as
 * {@link stringifyObject}) so it round-trips as a real array rather than a numeric-keyed object.
 */
function stringifyArray(inputArr: any[]) {
    const array: any[] = [];
    for (let i = 0, len = inputArr.length; i < len; ++i) {
        const value = inputArr[i];
        if (isPrimitive(value)) {
            array.push(value);
        }
    }
    return JSON.stringify(array);
}

function stringifyValue(value: any) {
    let output = value;
    if (value instanceof Error) {
        output = value.toString();
    } else if (Array.isArray(value)) {
        output = stringifyArray(value);
    } else if (typeof value === 'object') {
        output = stringifyObject(value);
    }
    return output;
}
/**
 * Formats a string, or the literal `null`/`undefined`, into a human-readable string.
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

// The captured diagnostic is untied — delivered to every listener rather than one grid's overlay. Reach
// for these only where no grid exists (pre-bean bootstrap failures, a destroyed grid, grid-agnostic
// utilities). Grid code must attribute instead, via `this.warn`/`beans.log` on a bean or `_warnForGrid`.
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _warnWithoutAttribution<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    logDiagnostic(_warnOnce, args[0], args[1] as any, 'warning', true);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _errorWithoutAttribution<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    logDiagnostic(_errorOnce, args[0], args[1] as any, 'error', false);
}

// Grid-id-first variants used by the grid-scoped LogService to attribute a diagnostic to the emitting
// grid. `gridId` is required — a caller with no grid must choose `_warnWithoutAttribution` explicitly
// rather than pass undefined. Loosely typed on the id/params — LogService is the ErrorId-checked surface.
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _warnForGrid(gridId: string, id: ErrorId, params?: any): void {
    logDiagnostic(_warnOnce, id, params, 'warning', true, gridId);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _deprecatedForGrid(gridId: string, id: ErrorId, params?: any): void {
    logDiagnostic(_warnOnce, id, params, 'deprecation', true, gridId);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _errorForGrid(gridId: string, id: ErrorId, params?: any): void {
    logDiagnostic(_errorOnce, id, params, 'error', false, gridId);
}

/** Used for messages before the ValidationService has been created */
export function _logPreInitErr<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>, defaultMessage: string) {
    logToConsole(_errorOnce, id, args as any, false, defaultMessage);
    emitDiagnostic(id, args as any, 'error', defaultMessage);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _logPreInitWarn<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>, defaultMessage: string) {
    logToConsole(_warnOnce, id, args as any, true, defaultMessage);
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
