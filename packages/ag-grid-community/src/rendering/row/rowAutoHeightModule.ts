import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { RowAutoHeightService } from './rowAutoHeightService';

export const RowAutoHeightModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowAutoHeightModule'),
    beans: [RowAutoHeightService],
};
