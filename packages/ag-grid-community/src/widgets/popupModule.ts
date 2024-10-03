import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { PopupService } from './popupService';

export const PopupModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PopupModule'),
    beans: [PopupService],
};
