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
 * A diagnostic captured for the developer overlay (config errors, runtime errors and warnings).
 */
export interface CapturedDiagnostic {
    id: ErrorId;
    params: any;
    severity: Severity;
    /**
     * The grid whose synchronous work emitted this, so a listener surfaces only its own grid's
     * diagnostics. Undefined when emitted outside any grid (e.g. a bootstrap failure).
     */
    gridId?: string;
    /** Fallback message used when the ValidationModule is not registered to supply the full text. */
    defaultMessage?: string;
}

/**
 * Stable identity key for deduping captured diagnostics: the same `id` and `params` yield the same key.
 * Non-serialisable params (functions, circular refs) fall back to `${id}:unserialisable:${fallbackSeed}`
 * so distinct entries are never collapsed — callers pass a per-call seed (a counter or index) for this.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
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

// The grid currently executing; diagnostics it emits are attributed to it
let activeGridId: string | undefined;

/**
 * Runs `fn` with `gridId` marked as the executing grid, so any diagnostics it emits are attributed to
 * that grid. The restore runs in a `finally`, so a diagnostic that throws (in throw mode) still restores
 * the previous grid.
 *
 * `fn` MUST be synchronous. Attribution only lasts until `fn` returns, so any work deferred past an
 * `await` or a scheduled callback runs unattributed — its diagnostics fall back to "no grid" rather than
 * being misattributed to whichever grid happens to be active by the time they fire. This is also why a
 * nested grid (e.g. a detail grid, created on a later frame) gets its own scope instead of inheriting
 * its parent's.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _runWithActiveGrid<T>(gridId: string, fn: () => T): T {
    const previous = activeGridId;
    activeGridId = gridId;
    try {
        return fn();
    } finally {
        activeGridId = previous;
    }
}

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
let throwThreshold: Severity | false = false;
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
    throwOn?: Severity | false;
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
 * Whether captured diagnostics are being collected, so hot paths (e.g. API dispatch) can skip the
 * active-grid bookkeeping entirely when no consumer is listening.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _isDiagnosticCaptureActive(): boolean {
    return captureEnabled;
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
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _provideBootstrapPanelRenderer(renderer: BootstrapPanelRenderer): void {
    bootstrapPanelRenderer = renderer;
}

/**
 * Renders the buffered diagnostics not tied to a grid (e.g. a missing row-model module that aborts grid
 * creation) into `container`, when the ValidationModule has provided a renderer. No-op otherwise, so core
 * stays decoupled and production pays nothing.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
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

function emitDiagnostic(id: ErrorId, params: any, severity: Severity, defaultMessage?: string): void {
    // Suppressed ids are omitted from the overlay and never throw; the console log has already fired.
    if (suppressedIds.has(id)) {
        return;
    }
    if (captureEnabled) {
        const diagnostic: CapturedDiagnostic = { id, params, severity, gridId: activeGridId, defaultMessage };
        if (bufferedDiagnostics.length < MAX_BUFFERED_DIAGNOSTICS) {
            bufferedDiagnostics.push(diagnostic);
        }
        for (const entry of diagnosticListeners) {
            if (shouldNotify(activeGridId, entry.gridId)) {
                entry.listener(diagnostic);
            }
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

function logToConsole<TId extends ErrorId>(
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _warn<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    logToConsole(_warnOnce, args[0], args[1] as any, true);
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
    logToConsole(_warnOnce, args[0], args[1] as any, true);
    emitDiagnostic(args[0], args[1] as any, 'deprecation');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _error<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
    logToConsole(_errorOnce, args[0], args[1] as any, false);
    emitDiagnostic(args[0], args[1] as any, 'error');
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
