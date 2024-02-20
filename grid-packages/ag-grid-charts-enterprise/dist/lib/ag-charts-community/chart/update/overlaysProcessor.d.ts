import type { DataService } from '../data/dataService';
import type { LayoutService } from '../layout/layoutService';
import type { ChartOverlays } from '../overlay/chartOverlays';
import type { ChartLike, UpdateProcessor } from './processor';
export declare class OverlaysProcessor<D extends object> implements UpdateProcessor {
    private chartLike;
    private readonly overlays;
    private readonly dataService;
    private readonly layoutService;
    private destroyFns;
    constructor(chartLike: ChartLike, overlays: ChartOverlays, dataService: DataService<D>, layoutService: LayoutService);
    destroy(): void;
    private onLayoutComplete;
    private toggleOverlay;
}
