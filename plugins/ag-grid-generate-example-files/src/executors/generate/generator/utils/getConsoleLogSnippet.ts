interface Params {
    pageName: string;
    exampleName: string;
}

export const CONSOLE_LOG_START = '/** CONSOLE LOG START **/';
export const CONSOLE_LOG_END = '/** CONSOLE LOG END **/';

/**
 * Override console log to send the log message to the parent window
 */
export const getConsoleLogSnippet = ({ pageName, exampleName }: Params) =>
    `${CONSOLE_LOG_START}
const PRIMITIVE_TYPES = ["string", "number", "boolean", "undefined", "null", "NaN", "symbol"];
const OBJECT_PROPERTIES_LIMIT = 3;

function getType(value) {
    if (value === null) return "null";
    if (Number.isNaN(value)) return "NaN";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    if (value instanceof RegExp) return "regexp";
    if (value instanceof Map) return "map";
    if (value instanceof Set) return "set";
    if (value instanceof WeakMap) return "weakmap";
    if (value instanceof WeakSet) return "weakset";
    if (value instanceof Promise) return "promise";
    if (value instanceof Error) return "error";
    if (typeof value === "object") return "object";
    return typeof value;
}

function safeStringify(obj, space = 2) {
    const seen = new WeakSet();
    const isLoggableArray = getType(obj) === "array" && obj.every(isLoggableType);
    const getObjectValue = (value) => {
        if (seen.has(value)) {
            return '[Circular]';
        } else if (value === undefined) {
            return 'undefined';
        }
        seen.add(value);

        // Include custom class names if available
        if (value.constructor && value.constructor.name && getType(value) !== 'object') {
            return \`\${value.constructor.name}Class { ... }\`;
        }

        return value;
    };
    return isLoggableArray ? JSON.stringify(obj) : JSON.stringify(
        obj,
        (_, value) => {
            const valueType = getType(value);
            let newValue = value;
            if (valueType === 'object') {
                newValue = getObjectValue(newValue);
            } else if (valueType === 'array') {
                newValue = value.map((item) => {
                    return getType(item === 'object') ? getObjectValue(item) : item;
                });
            }

            return newValue;
        },
        space
    );
}

function isPrimitiveType(value) {
    return PRIMITIVE_TYPES.includes(getType(value));
}

function isLoggableType(value) {
    const valueType = getType(value);

    return isPrimitiveType(value)
        || (valueType === "array" && value.every(isPrimitiveType))
        || (valueType === "object" && Object.values(value).every(isPrimitiveType) && Object.keys(value).length <= OBJECT_PROPERTIES_LIMIT);
}

function getConsoleValue(value) {
    return isPrimitiveType(value) ? value : {
        __consoleLogObject: true,
        isLoggable: isLoggableType(value),
        argType: getType(value),
        safeString: safeStringify(value)
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
${CONSOLE_LOG_END}`;
