import { defineCommunityModule } from '../interfaces/iModule';
import { RowNodeBlockLoader } from './rowNodeBlockLoader';

export const RowNodeBlockModule = defineCommunityModule('RowNodeBlockModule', {
    beans: [RowNodeBlockLoader],
});
