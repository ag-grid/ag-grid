import { BaseManager } from './baseManager';
function isEqual(a, b) {
    if (a === b)
        return true;
    if ((a === null || a === void 0 ? void 0 : a.series) !== (b === null || b === void 0 ? void 0 : b.series))
        return false;
    if ((a === null || a === void 0 ? void 0 : a.itemId) !== (b === null || b === void 0 ? void 0 : b.itemId))
        return false;
    if ((a === null || a === void 0 ? void 0 : a.datum) !== (b === null || b === void 0 ? void 0 : b.datum))
        return false;
    return true;
}
/**
 * Manages the actively highlighted series/datum for a chart. Tracks the requested highlights from
 * distinct dependents and handles conflicting highlight requests.
 */
export class HighlightManager extends BaseManager {
    constructor() {
        super();
        this.states = {};
        this.activeHighlight = undefined;
    }
    updateHighlight(callerId, highlightedDatum) {
        delete this.states[callerId];
        if (highlightedDatum != null) {
            this.states[callerId] = { highlightedDatum };
        }
        this.applyStates();
    }
    getActiveHighlight() {
        return this.activeHighlight;
    }
    applyStates() {
        const previousHighlight = this.activeHighlight;
        let highlightToApply = undefined;
        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { highlightedDatum }]) => (highlightToApply = highlightedDatum));
        this.activeHighlight = highlightToApply;
        const changed = !isEqual(previousHighlight, this.activeHighlight);
        if (changed) {
            const event = {
                type: 'highlight-change',
                previousHighlight,
                currentHighlight: this.activeHighlight,
            };
            this.listeners.dispatch('highlight-change', event);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaGxpZ2h0TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9pbnRlcmFjdGlvbi9oaWdobGlnaHRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUF5QjVDLFNBQVMsT0FBTyxDQUFDLENBQXNCLEVBQUUsQ0FBc0I7SUFDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3pCLElBQUksQ0FBQSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsTUFBTSxPQUFLLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxNQUFNLENBQUE7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUMxQyxJQUFJLENBQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLE1BQU0sT0FBSyxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsTUFBTSxDQUFBO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDMUMsSUFBSSxDQUFBLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxLQUFLLE9BQUssQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLEtBQUssQ0FBQTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRXhDLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsV0FBcUQ7SUFJdkY7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUpLLFdBQU0sR0FBbUMsRUFBRSxDQUFDO1FBQ3JELG9CQUFlLEdBQXdCLFNBQVMsQ0FBQztJQUl6RCxDQUFDO0lBRU0sZUFBZSxDQUFDLFFBQWdCLEVBQUUsZ0JBQXFDO1FBQzFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixJQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztTQUNoRDtRQUVELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRU8sV0FBVztRQUNmLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUMvQyxJQUFJLGdCQUFnQixHQUFtQyxTQUFTLENBQUM7UUFFakUseUJBQXlCO1FBQ3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUN0QixPQUFPLEVBQUU7YUFDVCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNYLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO1FBRXhDLE1BQU0sT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsRSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sS0FBSyxHQUF5QjtnQkFDaEMsSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsaUJBQWlCO2dCQUNqQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZUFBZTthQUN6QyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDdEQ7SUFDTCxDQUFDO0NBQ0oifQ==