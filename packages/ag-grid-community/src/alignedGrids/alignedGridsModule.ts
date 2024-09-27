import { defineCommunityModule } from '../interfaces/iModule';
import { AlignedGridsService } from './alignedGridsService';

export const AlignedGridsModule = defineCommunityModule('AlignedGridsModule', {
    beans: [AlignedGridsService],
});
