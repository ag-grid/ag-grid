import { defineCommunityModule } from '../interfaces/iModule';
import { ColumnAnimationService } from './columnAnimationService';

export const ColumnAnimationModule = defineCommunityModule('ColumnAnimationModule', {
    beans: [ColumnAnimationService],
});
