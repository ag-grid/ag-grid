import { defineCommunityModule } from '../../interfaces/iModule';
import { StickyRowService } from './stickyRowService';

export const StickyRowModule = defineCommunityModule('@ag-grid-community/sticky-row', {
    beans: [StickyRowService],
});
