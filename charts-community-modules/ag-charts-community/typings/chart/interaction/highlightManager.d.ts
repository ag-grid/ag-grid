import type { SizedPoint, Point } from '../../scene/point';
import { BaseManager } from './baseManager';
interface HighlightNodeDatum {
    readonly series: any;
    readonly itemId?: any;
    readonly datum: any;
    readonly xKey?: string;
    readonly yKey?: string;
    readonly cumulativeValue?: number;
    readonly aggregatedValue?: number;
    readonly domain?: [number, number];
    readonly point?: Readonly<SizedPoint>;
    readonly nodeMidPoint?: Readonly<Point>;
}
export interface HighlightChangeEvent {
    type: 'highlight-change';
    previousHighlight?: HighlightNodeDatum;
    currentHighlight?: HighlightNodeDatum;
}
/**
 * Manages the actively highlighted series/datum for a chart. Tracks the requested highlights from
 * distinct dependents and handles conflicting highlight requests.
 */
export declare class HighlightManager extends BaseManager<'highlight-change', HighlightChangeEvent> {
    private readonly states;
    private activeHighlight?;
    constructor();
    updateHighlight(callerId: string, highlightedDatum?: HighlightNodeDatum): void;
    getActiveHighlight(): HighlightNodeDatum | undefined;
    private applyStates;
}
export {};
//# sourceMappingURL=highlightManager.d.ts.map