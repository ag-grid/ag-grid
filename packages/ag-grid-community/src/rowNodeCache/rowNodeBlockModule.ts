import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { RowNodeBlockLoader } from './rowNodeBlockLoader';

export const RowNodeBlockModule: Module = {
    ...baseCommunityModule('RowNodeBlockModule'),
    beans: [RowNodeBlockLoader],
};
