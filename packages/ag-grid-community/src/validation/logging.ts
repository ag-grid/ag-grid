import { _errorOnce as errorLog, _warnOnce as warnLog } from '../utils/function';
import type { ErrorId, ErrorMap, ErrorParams } from './errorMessages/errorText';
import type { ValidationService } from './validationService';

let validationService: ValidationService | null = null;
let suppressAllLogging = false;
export function provideValidationServiceLogger(logger: ValidationService) {
    validationService = logger;
}
export function suppressAllLogs() {
    suppressAllLogging = true;
}

type LogFn = (message: string, ...args: any[]) => void;
// polyfill for NoInfer in TS 5.4 to enable forcing the generic type to be provided when calling warnOnce or errorOnce
type _NoInfer<T> = [T][T extends any ? 0 : never];

function getMsgOrDefault<TId extends ErrorId>(logger: LogFn, id: TId, ...args: ErrorParams<TId>) {
    if (suppressAllLogging) return;
    logger(`error #${id}`, ...(validationService?.getConsoleMessage(id, ...args) ?? [minifiedLog(id)]));
}

const minifiedLog = (errorNum: number, ...args: ErrorParams<any>) => {
    // work out how to pass args into the link if safe to do so
    return `visit www.ag-grid.com/error-message?id=${errorNum} for the full message or register the ValidationsModule to see the full message in the console.`;
};

export function _warnOnce1<
    TId extends ErrorId | null = null,
    TShowMessageAtCallLocation = TId extends ErrorId ? ErrorMap[TId] : null,
>(id: _NoInfer<TId>, ...args: ErrorParams<TId>) {
    getMsgOrDefault(warnLog, id!, ...(args as any));
}
export function _errorOnce1<
    TId extends ErrorId | null = null,
    TShowMessageAtCallLocation = TId extends ErrorId ? ErrorMap[TId] : null,
>(id: _NoInfer<TId>, ...args: ErrorParams<TId>) {
    getMsgOrDefault(errorLog, id!, ...(args as any));
}
