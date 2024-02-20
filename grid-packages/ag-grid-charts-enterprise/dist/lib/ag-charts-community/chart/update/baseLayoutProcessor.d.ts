import type { LayoutService } from '../layout/layoutService';
import type { ChartLike, UpdateProcessor } from './processor';
export declare class BaseLayoutProcessor implements UpdateProcessor {
    private readonly chartLike;
    private readonly layoutService;
    private destroyFns;
    constructor(chartLike: ChartLike, layoutService: LayoutService);
    destroy(): void;
    private layoutComplete;
    private positionPadding;
    private positionCaptions;
}
