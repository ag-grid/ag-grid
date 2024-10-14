import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { baseCommunityModule } from '../../interfaces/iModule';
import { CellFlashService } from './cellFlashService';

export const CellFlashModule: _ModuleWithoutApi = {
    ...baseCommunityModule('CellFlashModule'),
    beans: [CellFlashService],
};
