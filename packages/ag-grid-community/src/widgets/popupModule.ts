import { VERSION } from '../version';
import { PopupService } from './popupService';

export const PopupModule = {
    version: VERSION,
    moduleName: '@ag-grid-community/popup',
    beans: [PopupService],
};
