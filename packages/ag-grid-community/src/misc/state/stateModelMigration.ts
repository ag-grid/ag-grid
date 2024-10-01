import type { GridState } from '../../interfaces/gridState';

export function migrateGridStateModel(state: GridState): GridState {
    state = { ...state };
    // The `version` field was introduced in v32.2.0, so anything without that
    // field can be assumed to be compatible with v32.1.0
    if (!state.version) {
        state.version = '32.1.0';
    }

    switch (state.version) {
        case '32.1.0':
            state = migrateV32_1(state);
    }

    return state;
}

/**
 * Copies `rangeSelection` (deprecated) to `cellSelection`, but doesn't remove the former
 * for backwards compatibility
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
