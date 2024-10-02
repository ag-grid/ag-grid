import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { ColumnAnimationService } from './columnAnimationService';

export const ColumnAnimationModule: Module = {
    ...baseCommunityModule('ColumnAnimationModule'),
    beans: [ColumnAnimationService],
};
