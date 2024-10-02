import { baseCommunityModule } from '../interfaces/iModule';
import type { Module } from '../interfaces/iModule';
import { PopupService } from './popupService';

export const PopupModule: Module = {
    ...baseCommunityModule('PopupModule'),
    beans: [PopupService],
};
