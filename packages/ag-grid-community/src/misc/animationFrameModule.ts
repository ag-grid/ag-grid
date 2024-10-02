import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { AnimationFrameService } from './animationFrameService';

export const AnimationFrameModule: Module = {
    ...baseCommunityModule('AnimationFrameModule'),
    beans: [AnimationFrameService],
};
