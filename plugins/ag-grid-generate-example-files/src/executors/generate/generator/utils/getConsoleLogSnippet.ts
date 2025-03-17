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
function safeStringify(obj, space = 2) {
    const seen = new WeakSet();
    return JSON.stringify(
        obj,
        (_, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);

                // Include custom class names if available
                if (value.constructor && value.constructor.name && value.constructor.name !== 'Object') {
                    return \`\${value.constructor.name}Class { ... }\`;
                }
            }
            return value;
        },
        space
    );
}

function safeLogData(data) {
    if (typeof data === 'string' || typeof data === 'number') return data;
    return safeStringify(data);
}

const originalConsoleLog = console.log;
console.log = (...args) => {
    try {
        window.parent.postMessage({
            type: 'console-log',
            pageName: '${pageName}',
            exampleName: '${exampleName}',
            data: args.map(safeLogData),
        });
    } catch {
       // Posting is best-effort and shouldn't block normal console logging.
    }
    originalConsoleLog(...args);
};
${CONSOLE_LOG_END}`;
