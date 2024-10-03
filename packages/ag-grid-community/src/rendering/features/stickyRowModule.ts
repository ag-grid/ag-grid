import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { StickyRowService } from './stickyRowService';

export const StickyRowModule: _ModuleWithoutApi = {
    ...baseCommunityModule('StickyRowModule'),
    beans: [StickyRowService],
};
