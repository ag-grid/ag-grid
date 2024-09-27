import { _errorOnce as errorLog, _warnOnce as warnLog } from '../utils/function';
import type { ErrorId, ErrorMap, GetErrorParams } from './errorMessages/errorText';
import type { ValidationService } from './validationService';

let validationService: ValidationService | null = null;
let suppressAllLogging = false;
let baseDocLink = 'https://www.ag-grid.com/javascript-data-grid';
export function provideValidationServiceLogger(logger: ValidationService) {
    validationService = logger;
}
export function suppressAllLogs() {
    suppressAllLogging = true;
}
export function setValidationDocLink(docLink: string) {
    baseDocLink = docLink;
}

type LogFn = (message: string, ...args: any[]) => void;
// polyfill for NoInfer in TS 5.4 to enable forcing the generic type to be provided when calling warnOnce or errorOnce
type _NoInfer<T> = [T][T extends any ? 0 : never];

function getMsgOrDefault<TId extends ErrorId>(logger: LogFn, id: TId, args: GetErrorParams<TId>) {
    if (suppressAllLogging) return;
    logger(`error #${id}`, ...(validationService?.getConsoleMessage(id, args) ?? [minifiedLog(id, args)]));
}

const minifiedLog = (errorNum: number, args: GetErrorParams<any>) => {
    // work out how to pass args into the link if safe to do so
    // need to pass the framework name and version of AG Grid
    return `Visit ${baseDocLink}/errors/${errorNum} \n  Alternatively register the ValidationsModule to see the full message in the console.`;
};

export function _warnOnce1<
    TId extends ErrorId | null = null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = TId extends ErrorId ? ErrorMap[TId] : null,
>(id: _NoInfer<TId>, args: GetErrorParams<TId>) {
    getMsgOrDefault(warnLog, id!, args as any);
}

export function _errorOnce1<
    TId extends ErrorId | null = null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TShowMessageAtCallLocation = TId extends ErrorId ? ErrorMap[TId] : null,
>(id: _NoInfer<TId>, args: GetErrorParams<TId>) {
    getMsgOrDefault(errorLog, id!, args as any);
}

export * as _ErrorType from './errorMessages/errorText';
