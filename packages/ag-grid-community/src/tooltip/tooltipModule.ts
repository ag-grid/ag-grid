import { AgHighlightTooltipFeature, AgTooltipComponent, AgTooltipFeature } from 'ag-stack';

import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { PopupModule } from '../widgets/popupModule';
import tooltipCSS from './tooltip.css';
import { TooltipService } from './tooltipService';
import { TooltipStateManager } from './tooltipStateManager';

/**
 * @feature Tooltips
 * @colDef tooltipField, tooltipValueGetter, headerTooltip, tooltipComponentSelector
 */
export const TooltipModule: _ModuleWithoutApi = {
    moduleName: 'Tooltip',
    version: VERSION,
    beans: [TooltipService],
    dynamicBeans: {
        tooltipFeature: AgTooltipFeature as any,
        highlightTooltipFeature: AgHighlightTooltipFeature as any,
        tooltipStateManager: TooltipStateManager as any,
    },
    userComponents: {
        agTooltipComponent: AgTooltipComponent,
    },
    dependsOn: [PopupModule],
    css: [tooltipCSS],
};
