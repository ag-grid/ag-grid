import { SeriesNodeDatum } from '../series/series';
import { BaseManager } from './baseManager';

interface HighlightState {
    highlightedDatum: SeriesNodeDatum;
}

export interface HighlightChangeEvent {
    type: 'highlight-change';
    previousHighlight?: SeriesNodeDatum;
    currentHighlight?: SeriesNodeDatum;
}

function isEqual(a?: SeriesNodeDatum, b?: SeriesNodeDatum) {
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
    private activeHighlight?: SeriesNodeDatum = undefined;

    public constructor() {
        super();
    }

    public updateHighlight(callerId: string, highlightedDatum?: SeriesNodeDatum) {
        delete this.states[callerId];

        if (highlightedDatum != null) {
            this.states[callerId] = { highlightedDatum };
        }

        this.applyStates();
    }

    public getActiveHighlight(): SeriesNodeDatum | undefined {
        return this.activeHighlight;
    }

    private applyStates() {
        const previousHighlight = this.activeHighlight;
        let highlightToApply: SeriesNodeDatum | undefined = undefined;

        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { highlightedDatum }]) => (highlightToApply = highlightedDatum));

        this.activeHighlight = highlightToApply;

        const changed = !isEqual(previousHighlight, this.activeHighlight);
        if (changed) {
            this.registeredListeners['highlight-change']?.forEach((listener) => {
                listener.handler({
                    type: 'highlight-change',
                    previousHighlight,
                    currentHighlight: this.activeHighlight,
                });
            });
        }
    }
}
