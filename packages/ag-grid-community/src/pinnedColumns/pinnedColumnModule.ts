import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
import { PinnedColumnService } from './pinnedColumnService';

export const PinnedColumnModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PinnedColumnModule'),
    beans: [PinnedColumnService],
};
