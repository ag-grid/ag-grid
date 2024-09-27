import { defineCommunityModule } from '../../interfaces/iModule';
import { StickyRowService } from './stickyRowService';

export const StickyRowModule = defineCommunityModule('StickyRowModule', {
    beans: [StickyRowService],
});
