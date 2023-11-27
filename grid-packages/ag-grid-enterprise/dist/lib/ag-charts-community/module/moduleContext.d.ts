import type { ChartMode } from '../chart/chartMode';
import type { DataService } from '../chart/dataService';
import type { AnimationManager } from '../chart/interaction/animationManager';
import type { ChartEventManager } from '../chart/interaction/chartEventManager';
import type { CursorManager } from '../chart/interaction/cursorManager';
import type { HighlightManager } from '../chart/interaction/highlightManager';
import type { InteractionManager } from '../chart/interaction/interactionManager';
import type { TooltipManager } from '../chart/interaction/tooltipManager';
import type { ZoomManager } from '../chart/interaction/zoomManager';
import type { LayoutService } from '../chart/layout/layoutService';
import type { SeriesLayerManager } from '../chart/series/seriesLayerManager';
import type { SeriesStateManager } from '../chart/series/seriesStateManager';
import type { ISeries } from '../chart/series/seriesTypes';
import type { UpdateService } from '../chart/updateService';
import type { AgCartesianAxisPosition } from '../options/agChartOptions';
import type { Scene } from '../scene/scene';
import type { CallbackCache } from '../util/callbackCache';
export interface ModuleContext {
    document: Document;
    window: Window;
    scene: Scene;
    mode: ChartMode;
    animationManager: AnimationManager;
    chartEventManager: ChartEventManager;
    cursorManager: CursorManager;
    highlightManager: HighlightManager;
    interactionManager: InteractionManager;
    tooltipManager: TooltipManager;
    zoomManager: ZoomManager;
    dataService: DataService<ISeries<any>>;
    layoutService: Pick<LayoutService, 'addListener'>;
    updateService: UpdateService;
    callbackCache: CallbackCache;
    seriesStateManager: SeriesStateManager;
    seriesLayerManager: SeriesLayerManager;
}
export interface ModuleContextWithParent<P> extends ModuleContext {
    parent: P;
}
export interface AxisContext {
    axisId: string;
    position?: AgCartesianAxisPosition;
    direction: 'x' | 'y';
    continuous: boolean;
    keys: () => string[];
    scaleValueFormatter: (specifier: string) => ((x: any) => string) | undefined;
    scaleBandwidth: () => number;
    scaleConvert(val: any): number;
    scaleInvert(position: number): any;
}
export interface SeriesContext extends ModuleContext {
    series: {
        type: string;
    };
}
