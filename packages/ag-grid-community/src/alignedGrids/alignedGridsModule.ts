import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { AlignedGridsService } from './alignedGridsService';

export const AlignedGridsModule: Module = {
    ...baseCommunityModule('AlignedGridsModule'),
    beans: [AlignedGridsService],
};
