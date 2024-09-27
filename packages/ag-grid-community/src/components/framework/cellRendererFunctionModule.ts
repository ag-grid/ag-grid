import { defineCommunityModule } from '../../interfaces/iModule';
import { AgComponentUtils } from './agComponentUtils';

export const CellRendererFunctionModule = defineCommunityModule('@ag-grid-community/cell-renderer-function', {
    beans: [AgComponentUtils],
});
