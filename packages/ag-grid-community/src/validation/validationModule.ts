import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { ValidationService } from './validationService';

export const ValidationModule: Module = {
    ...baseCommunityModule('ValidationModule'),
    beans: [ValidationService],
};
