import { defineCommunityModule } from '../interfaces/iModule';
import { AnimationFrameService } from './animationFrameService';

export const AnimationFrameModule = defineCommunityModule('AnimationFrameModule', {
    beans: [AnimationFrameService],
});
