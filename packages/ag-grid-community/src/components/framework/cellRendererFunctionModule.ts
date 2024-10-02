import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module } from '../../interfaces/iModule';
import { AgComponentUtils } from './agComponentUtils';

export const CellRendererFunctionModule: Module = {
    ...baseCommunityModule('CellRendererFunctionModule'),
    beans: [AgComponentUtils],
};
