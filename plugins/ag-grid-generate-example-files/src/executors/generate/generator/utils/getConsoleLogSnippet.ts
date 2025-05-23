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

    function getType(value) {
        if (value === null) return "null";
        if (Number.isNaN(value)) return "nan";
        if (Array.isArray(value)) return "array";
        if (value === Infinity) return "infinity";
        if (value === -Infinity) return "negativeInfinity";
        if (value instanceof Date) return "date";
        if (value instanceof RegExp) return "regexp";
        if (value instanceof Map) return "map";
        if (value instanceof Set) return "set";
        if (value instanceof Event) return "event";
        if (value instanceof Element) return "element";
        if (value instanceof Document) return "document";
        if (value instanceof Window) return "window";
        if ((value instanceof CSSStyleSheet) ||
            (typeof value === 'object' &&
            value.constructor.name === 'CSSStyleSheet')
        ) return "cssStylesheet";
        if (value instanceof WeakMap) return "weakmap";
        if (value instanceof WeakSet) return "weakset";
        if (value instanceof Promise) return "promise";
        if (value instanceof Error) return "error";
        if (typeof value === 'object' &&
            value !== null &&
            value.constructor &&
            value.constructor.toString().startsWith('class ')) return "classInstance";
        if (typeof value === "object") return "object";
        return typeof value;
    }

    function updateWithReplacements(originalValue, replacementTypes) {
        const seen = new WeakSet();

        const updateWithReplacementsRecursively = (value) => {
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
                return value.map(item => updateWithReplacementsRecursively(item));
            } else if (valueType === 'object') {
                const obj = { ...value };

                seen.add(value);

                for (const key in value) {
                    const objValue = value[key];
                    const objValueType = getType(objValue);

                    if (replacementTypes.includes(objValueType)) {
                        obj[key] = getReplacementValue(objValue);
                    } else {
                        obj[key] = updateWithReplacementsRecursively(objValue);
                    }
                }

                return obj;
            } else {
                return value;
            }
        };

        return updateWithReplacementsRecursively(originalValue);
    }

    function isPrimitiveType(value) {
        return PRIMITIVE_TYPES.includes(getType(value));
    }

    function getConsoleValue(value) {
        if (isPrimitiveType(value)) {
            return value;
        }

        const updatedValue = updateWithReplacements(value, REPLACEMENT_TYPES);
        const safeString = JSON.stringify(updatedValue, null, 2);
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

    const originalConsoleLog = console.log;
    console.log = (...args) => {
        try {
            window.parent.postMessage({
                type: 'console-log',
                pageName: '${pageName}',
                exampleName: '${exampleName}',
                data: getConsoleLogData(args),
            });
        } catch(error) {
            // Posting is best-effort and shouldn't block normal console logging.
            ${logError ? 'console.error(error);' : undefined}
        }
        originalConsoleLog(...args);
    };
}
patchConsoleLog();

${CONSOLE_LOG_END}`;
