import type { GridState } from '../../interfaces/gridState';
import { VERSION } from '../../version';

/** This always returns a new object */
export function migrateGridStateModel(state: GridState): GridState {
    state = { ...state };
    // The `version` field was introduced in v32.2.0, so anything without that
    // field can be assumed to be compatible with v32.1.0
    if (!state.version) {
        state.version = '32.1.0';
    }

    if (state.version === '32.1.0') {
        state = migrateV32_1(state);
    }

    // `rangeSelection` was removed in v37, but states saved by v32.1 - v36 can still contain it
    delete (state as Record<string, unknown>).rangeSelection;

    state.version = VERSION;

    return state;
}

/**
 * Copies `rangeSelection` (removed in v37) to `cellSelection`
 */
function migrateV32_1(state: GridState): GridState {
    state.cellSelection = jsonGet(state, 'rangeSelection');
    return state;
}

function jsonGet(json: unknown, key: string): any {
    if (json && typeof json === 'object') {
        return (json as any)[key];
    }
}
