interface Params {
    pageName: string;
    exampleName: string;
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
 *   * `undefined`, `NaN`, `Infinity`, and `-Infinity` are replaced with `[TYPE:undefined]`, etc.
 *     This is deserialised on the parent window to the correct value.
 *
 */
export const getConsoleLogSnippet = ({ pageName, exampleName }: Params) =>
    `${CONSOLE_LOG_START}

function patchConsoleLog() {
    const PRIMITIVE_TYPES = ["string", "number", "boolean", "undefined", "null", "nan", "symbol"];
    const REPLACEMENT_TYPES = ["undefined", "nan", "infinity", "negativeInfinity"];
    const getReplacementTypeValue = (typeValue) => \`[TYPE:\${typeValue}]\`;

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

    function safeStringify(obj, space = 2) {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return "[Circular]";
                }
                seen.add(value);

                if (getType(value) === "classInstance") {
                    return value.constructor.name + "Class {}";
                }
            }
            return value;
        }, space);
    }

    function updateWithReplacements(value, replacementTypes) {
        const valueType = getType(value);
        
        if (replacementTypes.includes(valueType)) {
            return getReplacementTypeValue(valueType);
        } else if (valueType === 'array') {
            return value.map(item => updateWithReplacements(item, replacementTypes));
        } else if (valueType === 'object') {
            const obj = { ...value };
            for (const key in value) {
                const objValueType = getType(value[key]);
                if (replacementTypes.includes(objValueType)) {
                    obj[key] = getReplacementTypeValue(objValueType);
                } else {
                    obj[key] = updateWithReplacements(value[key], replacementTypes);
                }
            }
            return obj;
        } else {
            return value;
        }
    }

    function isPrimitiveType(value) {
        return PRIMITIVE_TYPES.includes(getType(value));
    }

    function getConsoleValue(value) {
        return isPrimitiveType(value) ? value : {
            __consoleLogObject: true,
            isLoggable: isPrimitiveType(value),
            argType: getType(value),
            safeString: safeStringify(updateWithReplacements(value, REPLACEMENT_TYPES)),
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
        } catch {
        // Posting is best-effort and shouldn't block normal console logging.
        }
        originalConsoleLog(...args);
    };
}
patchConsoleLog();

${CONSOLE_LOG_END}`;
