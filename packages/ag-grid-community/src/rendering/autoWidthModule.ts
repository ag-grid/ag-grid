import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { AutoWidthCalculator } from './autoWidthCalculator';

export const AutoWidthModule: Module = {
    ...baseCommunityModule('AutoWidthModule'),
    beans: [AutoWidthCalculator],
};
