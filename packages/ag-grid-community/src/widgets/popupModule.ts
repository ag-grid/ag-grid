import { defineCommunityModule } from '../interfaces/iModule';
import { PopupService } from './popupService';

export const PopupModule = defineCommunityModule('@ag-grid-community/popup', {
    beans: [PopupService],
});
