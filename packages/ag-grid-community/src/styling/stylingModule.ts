import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { CellStyleService } from './cellStyleService';
import { RowStyleService } from './rowStyleService';

export const CellStyleModule: Module = {
    ...baseCommunityModule('CellStyleModule'),
    beans: [CellStyleService],
};

export const RowStyleModule: Module = {
    ...baseCommunityModule('RowStyleModule'),
    beans: [RowStyleService],
};
