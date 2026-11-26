import { AgHighlightTooltipFeature, AgTooltipComponent, AgTooltipFeature } from 'ag-stack';

import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PopupModule } from '../widgets/popupModule';
import tooltipCSS from './tooltip.css';
import { TooltipCoreService } from './tooltipCoreService';
import { TooltipService } from './tooltipService';
import { TooltipStateManager } from './tooltipStateManager';
import { TooltipTouchCoordinator } from './tooltipTouchCoordinator';

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const TooltipCoreModule: _ModuleWithoutApi = {
    moduleName: 'TooltipCore',
    version: VERSION,
    beans: [TooltipCoreService, TooltipTouchCoordinator],
    dynamicBeans: {
        tooltipStateManager: TooltipStateManager as any,
    },
    userComponents: {
        agTooltipComponent: AgTooltipComponent,
    },
    dependsOn: [PopupModule],
    css: [tooltipCSS],
};

/**
 * @feature Tooltips
 * @colDef tooltip, tooltipField, tooltipValueGetter, headerTooltip, headerTooltipValueGetter, tooltipComponentSelector
 */
export const TooltipModule: _ModuleWithoutApi = {
    moduleName: 'Tooltip',
    version: VERSION,
    beans: [TooltipService],
    dynamicBeans: {
        tooltipFeature: AgTooltipFeature as any,
        highlightTooltipFeature: AgHighlightTooltipFeature as any,
    },
    userComponents: {
        agBuiltInTooltipComponent: {
            classImp: AgTooltipComponent,
            processParams: (params) => ({ ...params, value: params.text }),
        },
    },
    dependsOn: [TooltipCoreModule],
};
