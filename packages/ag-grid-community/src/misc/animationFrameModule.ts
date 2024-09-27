import { defineCommunityModule } from '../interfaces/iModule';
import { AnimationFrameService } from './animationFrameService';

export const AnimationFrameModule = defineCommunityModule('@ag-grid-community/animation-frame', {
    beans: [AnimationFrameService],
});
