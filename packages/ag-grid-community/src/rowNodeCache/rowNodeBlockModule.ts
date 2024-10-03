import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { RowNodeBlockLoader } from './rowNodeBlockLoader';

export const RowNodeBlockModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowNodeBlockModule'),
    beans: [RowNodeBlockLoader],
};
