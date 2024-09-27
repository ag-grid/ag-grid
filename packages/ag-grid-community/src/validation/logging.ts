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

const minifiedLog = (errorNum: number, args: GetErrorParams<any>) => {
    const params = new URLSearchParams();
    Object.entries(args as any).forEach(([key, value]) => {
        params.append(key, (value as any)?.toString?.());
    });

    return `Visit ${baseDocLink}/errors/${errorNum}?${params.toString()} \n  Alternatively register the ValidationModule to see the full message in the console.`;
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
