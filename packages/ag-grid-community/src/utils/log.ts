import { _doOnce } from 'ag-stack';

import type { GridOptionsService } from '../gridOptionsService';

/** Writes a debug line with the standard grid prefix. Callers are responsible for the `debug` check. */
export function _logDebug(message: string, ...args: any[]) {
    // eslint-disable-next-line no-console
    console.log('AG Grid: ' + message, ...args);
}

export function _logIfDebug(gos: GridOptionsService, message: string, ...args: any[]) {
    if (gos.get('debug')) {
        _logDebug(message, ...args);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _warnOnce(msg: string, ...args: any[]) {
    _doOnce(() => _consoleWarn(msg, ...args), msg + args?.join(''));
}
export function _errorOnce(msg: string, ...args: any[]) {
    _doOnce(() => _consoleError(msg, ...args), msg + args?.join(''));
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _consoleError(msg: string, ...args: any[]) {
    // eslint-disable-next-line no-console
    console.error('AG Grid: ' + msg, ...args);
}

export function _consoleWarn(msg: string, ...args: any[]) {
    // eslint-disable-next-line no-console
    console.warn('AG Grid: ' + msg, ...args);
}
