/**
 * Get the message config for printing out on the console with styles
 *
 * @param args Args for console log
 * @returns Message config that can be passed into `console.log(messageConfig, 'css-styles', ...args);`
 */
export function getStyledConsoleMessageConfig(...args) {
    let messageConfig = '%c';

    args.forEach((argument) => {
        const type = typeof argument;
        switch (type) {
            case 'bigint':
            case 'number':
            case 'boolean':
                messageConfig += '%d';
                break;

            case 'string':
                messageConfig += '%s';
                break;

            case 'object':
            case 'undefined':
            default:
                messageConfig += '%o';
        }
    });

    return messageConfig;
}
