import { existsSync, readFileSync } from 'fs';

import type { GridOptionsType } from '../src/executors/generate/generator/types';
import { getGridOptionsType } from './buildGridOptionsType';

/**
 * Location of the cached GridOptions type surface, relative to the workspace root.
 *
 * Written by the `ag-grid-generate-example-files:build-grid-options-types` target, which owns the
 * expensive `ts.createProgram` walk over the community type declarations so that the per-example
 * `generate-example` tasks do not each have to repeat it.
 */
export const GRID_OPTIONS_TYPES_FILE = 'dist/plugins/ag-grid-generate-example-files/gridOptionsTypes.json';

/**
 * Reads the cached GridOptions type surface, falling back to building it in-process when the cache
 * is absent so that the executor still works when invoked outside of Nx.
 */
export function readGridOptionsType(): Record<string, GridOptionsType> {
    if (!existsSync(GRID_OPTIONS_TYPES_FILE)) {
        console.warn(
            `${GRID_OPTIONS_TYPES_FILE} not found, building the GridOptions types in-process instead. ` +
                `Run 'nx run ag-grid-generate-example-files:build-grid-options-types' to avoid this.`
        );
        return getGridOptionsType();
    }

    return JSON.parse(readFileSync(GRID_OPTIONS_TYPES_FILE, 'utf-8'));
}
