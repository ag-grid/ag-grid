import { defineCommunityModule } from '../interfaces/iModule';
import { PopupService } from './popupService';

export const PopupModule = defineCommunityModule('PopupModule', {
    beans: [PopupService],
});
