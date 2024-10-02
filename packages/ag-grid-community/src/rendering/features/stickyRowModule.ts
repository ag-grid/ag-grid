import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module } from '../../interfaces/iModule';
import { StickyRowService } from './stickyRowService';

export const StickyRowModule: Module = {
    ...baseCommunityModule('StickyRowModule'),
    beans: [StickyRowService],
};
