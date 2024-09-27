import { defineCommunityModule } from '../interfaces/iModule';
import { ColumnAnimationService } from './columnAnimationService';

export const ColumnAnimationModule = defineCommunityModule('@ag-grid-community/column-animation', {
    beans: [ColumnAnimationService],
});
