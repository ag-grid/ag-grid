import { _doOnce } from '../agStack/utils/function';
import type { GridOptionsService } from '../gridOptionsService';

/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _logIfDebug(gos: GridOptionsService, message: string, ...args: any[]) {
    if (gos.get('debug')) {
        // eslint-disable-next-line no-console
        console.log('AG Grid: ' + message, ...args);
    }
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _warnOnce(msg: string, ...args: any[]) {
    // eslint-disable-next-line no-console
    _doOnce(() => console.warn('AG Grid: ' + msg, ...args), msg + args?.join(''));
} /** @AG_Grid_Internal Not for general use, may change without warning. */
export function _errorOnce(msg: string, ...args: any[]) {
    // eslint-disable-next-line no-console
    _doOnce(() => console.error('AG Grid: ' + msg, ...args), msg + args?.join(''));
}
