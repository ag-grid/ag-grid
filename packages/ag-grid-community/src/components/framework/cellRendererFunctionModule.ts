import { defineCommunityModule } from '../../interfaces/iModule';
import { AgComponentUtils } from './agComponentUtils';

export const CellRendererFunctionModule = defineCommunityModule('CellRendererFunctionModule', {
    beans: [AgComponentUtils],
});
