import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { CellStyleService } from './cellStyleService';
import { RowStyleService } from './rowStyleService';

export const CellStyleModule: _ModuleWithoutApi = {
    ...baseCommunityModule('CellStyleModule'),
    beans: [CellStyleService],
};

export const RowStyleModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowStyleModule'),
    beans: [RowStyleService],
};
