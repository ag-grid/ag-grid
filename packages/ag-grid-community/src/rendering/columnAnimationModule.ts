import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { ColumnAnimationService } from './columnAnimationService';

export const ColumnAnimationModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnAnimationModule'),
    beans: [ColumnAnimationService],
};
