import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PopupService } from './popupService';

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const PopupModule: _ModuleWithoutApi = {
    moduleName: 'Popup',
    version: VERSION,
    beans: [PopupService],
};
