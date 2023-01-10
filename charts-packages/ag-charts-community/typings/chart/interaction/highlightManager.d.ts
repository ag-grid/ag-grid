import { SeriesNodeDatum } from '../series/series';
import { BaseManager } from './baseManager';
export interface HighlightChangeEvent {
    type: 'highlight-change';
    previousHighlight?: SeriesNodeDatum;
    currentHighlight?: SeriesNodeDatum;
}
/**
 * Manages the actively highlighted series/datum for a chart. Tracks the requested highlights from
 * distinct dependents and handles conflicting highlight requests.
 */
export declare class HighlightManager extends BaseManager<'highlight-change', HighlightChangeEvent> {
    private readonly states;
    private activeHighlight?;
    constructor();
    updateHighlight(callerId: string, highlightedDatum?: SeriesNodeDatum): void;
    getActiveHighlight(): SeriesNodeDatum | undefined;
    private applyStates;
}
