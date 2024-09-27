import { defineCommunityModule } from '../interfaces/iModule';
import { AlignedGridsService } from './alignedGridsService';

export const AlignedGridsModule = defineCommunityModule('@ag-grid-community/aligned-grid', {
    beans: [AlignedGridsService],
});
