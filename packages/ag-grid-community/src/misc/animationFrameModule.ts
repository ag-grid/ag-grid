import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { AnimationFrameService } from './animationFrameService';

export const AnimationFrameModule: _ModuleWithoutApi = {
    ...baseCommunityModule('AnimationFrameModule'),
    beans: [AnimationFrameService],
};
