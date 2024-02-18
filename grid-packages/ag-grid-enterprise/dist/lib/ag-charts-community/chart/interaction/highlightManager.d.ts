import type { SeriesNodeDatum } from '../series/seriesTypes';
import { BaseManager } from './baseManager';
export interface HighlightNodeDatum extends SeriesNodeDatum {
    readonly xKey?: string;
    readonly yKey?: string;
    readonly colorValue?: number;
    readonly cumulativeValue?: number;
    readonly aggregatedValue?: number;
    readonly domain?: [number, number];
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
    private readonly highlightStates;
    private activeHighlight?;
    private readonly pickedStates;
    private activePicked?;
    updateHighlight(callerId: string, highlightedDatum?: HighlightNodeDatum): void;
    getActiveHighlight(): HighlightNodeDatum | undefined;
    updatePicked(callerId: string, clickableDatum?: SeriesNodeDatum): void;
    getActivePicked(): SeriesNodeDatum | undefined;
    private applyHighlightStates;
    private applyPickedStates;
    private isEqual;
}
