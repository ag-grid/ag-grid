import { _errorOnce as errorLog, _warnOnce as warnLog } from '../utils/function';
import type { ErrorId, ErrorMap, GetErrorParams } from './errorMessages/errorText';
import type { ValidationService } from './validationService';

let validationService: ValidationService | null = null;
let suppressAllLogging = false;
let baseDocLink = 'https://www.ag-grid.com/javascript-data-grid';
/**
 * The ValidationService passes itself in if it has been included.
 * @param logger
 */
export function provideValidationServiceLogger(logger: ValidationService) {
    validationService = logger;
}
export function suppressAllLogs() {
    suppressAllLogging = true;
}
/** Set by the Framework override to give us accurate links for the framework  */
export function setValidationDocLink(docLink: string) {
    baseDocLink = docLink;
}

type LogFn = (message: string, ...args: any[]) => void;

function getMsgOrDefault<TId extends ErrorId>(logger: LogFn, id: TId, args: GetErrorParams<TId>) {
    if (suppressAllLogging) return;
    logger(`error #${id}`, ...(validationService?.getConsoleMessage(id, args) ?? [minifiedLog(id, args)]));
}

/**
 * Stringify object, removing any circular dependencies
 */
function stringifyObject(inputObj: any) {
    const object: Record<string, any> = {};

    for (const prop in Object.entries(inputObj)) {
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

export function getErrorLink(errorNum: ErrorId, args: GetErrorParams<any>) {
    const params = new URLSearchParams();
    Object.entries(args as any).forEach(([key, value]) => {
        params.append(key, stringifyValue(value));
    });

    return `${baseDocLink}/errors/${errorNum}?${params.toString()}`;
}

const minifiedLog = (errorNum: ErrorId, args: GetErrorParams<any>) => {
    const errorLink = getErrorLink(errorNum, args);
    return `Visit ${errorLink} \n  Alternatively register the ValidationModule to see the full message in the console.`;
};

export function _logWarn<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>) {
    getMsgOrDefault(warnLog, id!, args as any);
}

export function _logError<
    TId extends ErrorId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = ErrorMap[TId],
>(id: TId, args: GetErrorParams<TId>) {
    getMsgOrDefault(errorLog, id!, args as any);
}
