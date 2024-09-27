import { defineCommunityModule } from '../interfaces/iModule';
import { RowNodeBlockLoader } from './rowNodeBlockLoader';

export const RowNodeBlockModule = defineCommunityModule('@ag-grid-community/row-node-block', {
    beans: [RowNodeBlockLoader],
});
