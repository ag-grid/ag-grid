import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

import { getGridOptionsType } from './buildGridOptionsType';
import { GRID_OPTIONS_TYPES_FILE } from './gridOptionsTypesFile';

// Entry point for the `build-grid-options-types` target. Must be run from the workspace root, as
// both the source file it parses and the file it writes are workspace root relative.
mkdirSync(dirname(GRID_OPTIONS_TYPES_FILE), { recursive: true });
writeFileSync(GRID_OPTIONS_TYPES_FILE, JSON.stringify(getGridOptionsType(), null, 2));
