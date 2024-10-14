import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
import { PinnedWidthService } from './pinnedWidthService';

export const PinnedColumnModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PinnedColumnModule'),
    beans: [PinnedWidthService],
};
