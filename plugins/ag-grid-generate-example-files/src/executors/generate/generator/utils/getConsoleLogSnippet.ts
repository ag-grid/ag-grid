interface Params {
    pageName: string;
    exampleName: string;
    logError?: boolean;
}

export const CONSOLE_LOG_START = '/** CONSOLE LOG START **/';
export const CONSOLE_LOG_END = '/** CONSOLE LOG END **/';

/**
 * Override console log to send the log message to the parent window
 *
 * Values need to be serialised to be able to be passed through to the parent window using
 * `window.parent.postMessage`. However, there are some extra processing steps required
 * due to the limitations of `JSON.stringify`:
 *
 *   * Circular references are replaced with `[Circular]`
 *   * Class instances are replaced with `ClassNameClass {}`
 *   * Event instances are replaced with `EventName {}`
 *   * `undefined`, `NaN`, `Infinity`, and `-Infinity` are replaced with `[TYPE:undefined]`, etc.
 *     This is deserialised on the parent window to the correct value.
 *
 */
export const getConsoleLogSnippet = ({ pageName, exampleName, logError }: Params) =>
    `${CONSOLE_LOG_START}

function patchConsoleLog() {
    const PRIMITIVE_TYPES = ["string", "number", "boolean", "undefined", "null", "nan", "symbol"];
    const REPLACEMENT_TYPES = [
        "undefined",
        "nan",
        "infinity",
        "negativeInfinity",
        "classInstance",
        "event",
        "cssStylesheet",
        "element",
        "document",
        "window"
    ];
    const REPLACEMENT_CLASS_MAPPING = {
        "AgColumn": (value) => \`ColumnClass { colId: '\${value.colId}' }\`,
        "RowNode": (value) => \`IRowNodeClass { rowId: '\${value.id}' }\`,
    }
    const getReplacementValue = (value) => {
        const valueType = getType(value);
        if (valueType === "classInstance") {
            const className = value.constructor.name;
            if (className in REPLACEMENT_CLASS_MAPPING) {
                return REPLACEMENT_CLASS_MAPPING[className](value);
            }
            return className + "Class {}";
        } else if (valueType === "event") {
            return value.constructor.name + " { type: '" + value.type + "' }";
        } else if (valueType === "cssStylesheet") {
            return value.constructor.name + " {}";
        } else if (valueType === 'element') {
             return "Element { localName: '" + value.localName + "' }";
        } else if (valueType === 'document') {
             return "Document {}";
        } else if (valueType === 'window') {
             return "Window {}";
        }

        return \`[TYPE:\${valueType}]\`;
    };

    // Cache the resolved type per constructor. Repeated instances of the same class
    // (e.g. every RowNode on every onRowDragMove tick) collapse to a WeakMap.get.
    // Detection rule: any object whose constructor is set and is NOT Object is treated
    // as a class instance and replaced with a short summary instead of being walked.
    // The previous startsWith("class ") check missed minified output where terser
    // strips the space between the class keyword and the opening brace.
    const typeByConstructor = new WeakMap();
    function resolveTypeFromInstance(value, ctor) {
        if (value instanceof Event) return "event";
        if (value instanceof Element) return "element";
        if (value instanceof Document) return "document";
        if (value instanceof Window) return "window";
        if (value instanceof Date) return "date";
        if (value instanceof RegExp) return "regexp";
        if (value instanceof Map) return "map";
        if (value instanceof Set) return "set";
        if (value instanceof Error) return "error";
        if (value instanceof Promise) return "promise";
        if (value instanceof WeakMap) return "weakmap";
        if (value instanceof WeakSet) return "weakset";
        if ((typeof CSSStyleSheet !== 'undefined' && value instanceof CSSStyleSheet) ||
            (ctor && ctor.name === 'CSSStyleSheet')) return "cssStylesheet";
        if (!ctor || ctor === Object) return "object";
        return "classInstance";
    }

    function getType(value) {
        if (value === null) return "null";
        const t = typeof value;
        if (t !== 'object') {
            if (t === 'number') {
                if (Number.isNaN(value)) return "nan";
                if (value === Infinity) return "infinity";
                if (value === -Infinity) return "negativeInfinity";
            }
            return t;
        }
        if (Array.isArray(value)) return "array";
        const ctor = value.constructor;
        if (ctor) {
            const cached = typeByConstructor.get(ctor);
            if (cached !== undefined) return cached;
            const resolved = resolveTypeFromInstance(value, ctor);
            typeByConstructor.set(ctor, resolved);
            return resolved;
        }
        return "object";
    }

    // Walk caps. Class instances are already summarised by resolveTypeFromInstance and
    // don't trigger any of these. The depth cap is the safety net for nested literal
    // data; the key/length caps short-circuit any plain object or array that's too big
    // to be useful in a console log (e.g. a row-node-shaped graph that escaped class
    // detection, a large user context object, or an array of records). Cheap to check —
    // Object.keys is one allocation and array.length is O(1) — so the cost stays
    // proportional to "how much we'd render", not "how big the input is".
    const MAX_DEPTH = 4;
    const MAX_KEYS = 30;
    const MAX_ARRAY_LEN = 30;

    function updateWithReplacements(originalValue, replacementTypes) {
        const seen = new WeakSet();

        const updateWithReplacementsRecursively = (value, depth) => {
            const valueType = getType(value);

            if (seen.has(value)) {
                if (replacementTypes.includes(valueType)) {
                    return getReplacementValue(value);
                } else {
                    return "[Circular]";
                }
            }

            if (replacementTypes.includes(valueType)) {
                return getReplacementValue(value);
            } else if (valueType === 'array') {
                if (depth >= MAX_DEPTH) return "[Array truncated]";
                if (value.length > MAX_ARRAY_LEN) return "[Array: " + value.length + " items]";
                return value.map(item => updateWithReplacementsRecursively(item, depth + 1));
            } else if (valueType === 'object') {
                if (depth >= MAX_DEPTH) return "[Object truncated]";
                const keys = Object.keys(value);
                if (keys.length > MAX_KEYS) return "[Object: " + keys.length + " keys]";
                const obj = {};
                seen.add(value);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const objValue = value[key];
                    const objValueType = getType(objValue);
                    if (replacementTypes.includes(objValueType)) {
                        obj[key] = getReplacementValue(objValue);
                    } else {
                        obj[key] = updateWithReplacementsRecursively(objValue, depth + 1);
                    }
                }
                return obj;
            } else {
                return value;
            }
        };

        return updateWithReplacementsRecursively(originalValue, 0);
    }

    function isPrimitiveType(value) {
        return PRIMITIVE_TYPES.includes(getType(value));
    }

    function getConsoleValue(value) {
        if (isPrimitiveType(value)) {
            return value;
        }

        const updatedValue = updateWithReplacements(value, REPLACEMENT_TYPES);
        const safeString = JSON.stringify(updatedValue);
        return {
            __consoleLogObject: true,
            isLoggable: isPrimitiveType(value),
            argType: getType(value),
            safeString,
        }
    }

    function getConsoleLogData(args) {
        return args.map(getConsoleValue);
    }

    // High-frequency console.log calls (e.g. onRowDragMove firing per mousemove) used to
    // serialise their args synchronously inside the call site, blocking the drag handler
    // for ~25ms per call on real grid events. We now capture args by reference and run
    // the deep walk + JSON.stringify inside an rAF flush, so the synchronous cost of a
    // patched console.log is just push + schedule.
    //
    // Caveat: callers that mutate a logged object before the next animation frame will
    // see the mutated value in the console panel. This matches real DevTools (which
    // lazy-inspects on expand) and is harmless for the typical case of logging fresh
    // event objects emitted by libraries like AG Grid.
    const pendingLogs = [];
    let flushScheduled = false;

    function flushPendingLogs() {
        flushScheduled = false;
        if (pendingLogs.length === 0) return;
        const batch = pendingLogs.splice(0, pendingLogs.length);
        const logs = batch.map(function (entry) {
            return {
                type: 'console-' + entry.name,
                data: getConsoleLogData(entry.args),
            };
        });
        try {
            window.parent.postMessage({
                type: 'console-batch',
                pageName: '${pageName}',
                exampleName: '${exampleName}',
                logs: logs,
            });
        } catch(error) {
            ${logError ? 'console.error(error);' : ''}
        }
    }

    function scheduleFlush() {
        if (flushScheduled) return;
        flushScheduled = true;
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(flushPendingLogs);
        } else {
            setTimeout(flushPendingLogs, 16);
        }
    }

    // we ignore console.error to avoid printing license messages, as well as infinite try catch loop below
    ['log', 'info', 'warn', 'table', 'debug'].map(name => [name, console[name]]).forEach(([name, originalMethod]) => {
        console[name] = (...args) => {
            originalMethod(...args);
            try {
                pendingLogs.push({ name: name, args: args });
                scheduleFlush();
            } catch(error) {
                // Buffering is best-effort and shouldn't block normal console logging.
                ${logError ? 'console.error(error);' : ''}
            }
        };
        console[name]._original = originalMethod;
    });
}
patchConsoleLog();

${CONSOLE_LOG_END}`;
