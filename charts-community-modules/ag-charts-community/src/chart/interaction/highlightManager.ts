import { SizedPoint, Point } from '../../scene/point';
import { BaseManager } from './baseManager';

interface HighlightState {
    highlightedDatum: HighlightNodeDatum;
}

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
    readonly nodeMidPoint: Readonly<Point>;
}

export interface HighlightChangeEvent {
    type: 'highlight-change';
    previousHighlight?: HighlightNodeDatum;
    currentHighlight?: HighlightNodeDatum;
}

function isEqual(a?: HighlightNodeDatum, b?: HighlightNodeDatum) {
    if (a === b) return true;
    if (a?.series !== b?.series) return false;
    if (a?.itemId !== b?.itemId) return false;
    if (a?.datum !== b?.datum) return false;

    return true;
}

/**
 * Manages the actively highlighted series/datum for a chart. Tracks the requested highlights from
 * distinct dependents and handles conflicting highlight requests.
 */
export class HighlightManager extends BaseManager<'highlight-change', HighlightChangeEvent> {
    private readonly states: Record<string, HighlightState> = {};
    private activeHighlight?: HighlightNodeDatum = undefined;

    public constructor() {
        super();
    }

    public updateHighlight(callerId: string, highlightedDatum?: HighlightNodeDatum) {
        delete this.states[callerId];

        if (highlightedDatum != null) {
            this.states[callerId] = { highlightedDatum };
        }

        this.applyStates();
    }

    public getActiveHighlight(): HighlightNodeDatum | undefined {
        return this.activeHighlight;
    }

    private applyStates() {
        const previousHighlight = this.activeHighlight;
        let highlightToApply: HighlightNodeDatum | undefined = undefined;

        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { highlightedDatum }]) => (highlightToApply = highlightedDatum));

        this.activeHighlight = highlightToApply;

        const changed = !isEqual(previousHighlight, this.activeHighlight);
        if (changed) {
            const event: HighlightChangeEvent = {
                type: 'highlight-change',
                previousHighlight,
                currentHighlight: this.activeHighlight,
            };
            this.listeners.dispatch('highlight-change', event);
        }
    }
}
