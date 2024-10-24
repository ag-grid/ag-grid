import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { PopupModule } from '../widgets/popupModule';
import { TooltipComponent } from './tooltipComponent';
import { TooltipFeature } from './tooltipFeature';
import { TooltipService } from './tooltipService';

export const TooltipCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('TooltipCoreModule'),
    beans: [TooltipService],
    dynamicBeans: {
        tooltipFeature: TooltipFeature as any,
    },
    dependsOn: [PopupModule],
};

export const TooltipCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('TooltipCompModule'),
    userComponents: {
        agTooltipComponent: TooltipComponent,
    },
};

export const TooltipModule: _ModuleWithoutApi = {
    ...baseCommunityModule('TooltipModule'),
    dependsOn: [TooltipCoreModule, TooltipCompModule],
};
