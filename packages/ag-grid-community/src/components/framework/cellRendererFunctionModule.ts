import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { AgComponentUtils } from './agComponentUtils';

export const CellRendererFunctionModule: _ModuleWithoutApi = {
    ...baseCommunityModule('CellRendererFunctionModule'),
    beans: [AgComponentUtils],
};
