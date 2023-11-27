import type { LayoutService } from '../layout/layoutService';
import type { ChartLike } from './processor';
export declare class BaseLayoutProcessor {
    private readonly chartLike;
    private readonly layoutService;
    private destroyFns;
    constructor(chartLike: ChartLike, layoutService: LayoutService);
    destroy(): void;
    private layoutComplete;
    private positionPadding;
    private positionCaptions;
}
