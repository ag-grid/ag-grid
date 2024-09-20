import { _errorOnce as errorLog, _warnOnce as warnLog } from '../../utils/function';
import type { ValidationService } from '../validationService';
import type { ConsoleID, ConsoleMessageParams, ConsoleMessages } from './consoleMappings';

export type * as _ErrorType from './errorCodeTypes';

const detail = 'Include ValidationModule to see the full message. Or click www.ag-grid.com/error-message?id=2';

type LogFn = (message: string, ...args: any[]) => void;
type _NoInfer<T> = [T][T extends any ? 0 : never]; // polyfill for NoInfer in TS 5.4

let validationService: ValidationService | null = null;
let suppressAllLogging = false;
export function provideValidationServiceLogger(logger: ValidationService) {
    validationService = logger;
}
export function suppressAllLogs() {
    suppressAllLogging = true;
}

function getMsgOrDefault<TId extends ConsoleID>(logger: LogFn, id: TId, ...args: ConsoleMessageParams<TId>) {
    if (suppressAllLogging) return;
    const errorID = `Error ID: ${id}`;
    if (!validationService) {
        logger(errorID, detail, ...args);
    } else {
        logger(errorID, ...validationService.getConsoleMessage(id, ...args));
    }
}

export function _warnOnce1<
    TId extends ConsoleID | null = null,
    TShowMessageAtCallLocation = TId extends ConsoleID ? ConsoleMessages[TId] : null,
>(id: _NoInfer<TId>, ...args: any[]) {
    getMsgOrDefault(warnLog, id!, ...(args as any));
}
export function _errorOnce1<
    TId extends ConsoleID | null = null,
    TShowMessageAtCallLocation = TId extends ConsoleID ? ConsoleMessages[TId] : null,
>(id: _NoInfer<TId>, ...args: any[]) {
    getMsgOrDefault(errorLog, id!, ...(args as any));
}
