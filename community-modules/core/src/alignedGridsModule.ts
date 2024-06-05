import { AlignedGridsService } from './alignedGridsService';
import type { Module } from './interfaces/iModule';
import { VERSION } from './version';

export const AlignedGridsModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/aligned-grid',
    beans: [AlignedGridsService],
};
