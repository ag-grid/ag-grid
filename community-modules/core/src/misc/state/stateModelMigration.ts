import type { GridState } from '../../interfaces/gridState';

export function migrateGridStateModel(state: GridState): GridState {
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

function migrateV32_1(state: GridState): GridState {
    state.cellSelection = jsonGet(state, 'rangeSelection');
    jsonDelete(state, 'rangeSelection');
    return state;
}

function jsonGet(json: unknown, key: string): any {
    if (json && typeof json === 'object') {
        return (json as any)[key];
    }
}

function jsonDelete(json: unknown, key: string): void {
    if (json && typeof json === 'object') {
        delete (json as any)[key];
    }
}
