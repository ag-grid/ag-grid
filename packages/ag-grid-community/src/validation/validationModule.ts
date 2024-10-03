import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { ValidationService } from './validationService';

export const ValidationModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ValidationModule'),
    beans: [ValidationService],
};
