import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { AlignedGridsService } from './alignedGridsService';

export const AlignedGridsModule: _ModuleWithoutApi = {
    ...baseCommunityModule('AlignedGridsModule'),
    beans: [AlignedGridsService],
};
