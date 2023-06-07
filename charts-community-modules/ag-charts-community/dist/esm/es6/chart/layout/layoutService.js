import { Listeners } from '../../util/listeners';
function isLayoutStage(t) {
    return t !== 'layout-complete';
}
function isLayoutComplete(t) {
    return t === 'layout-complete';
}
export class LayoutService {
    constructor() {
        this.layoutProcessors = new Listeners();
        this.listeners = new Listeners();
    }
    addListener(type, cb) {
        if (isLayoutStage(type)) {
            return this.layoutProcessors.addListener(type, cb);
        }
        else if (isLayoutComplete(type)) {
            return this.listeners.addListener(type, cb);
        }
        throw new Error('AG Charts - unsupported listener type: ' + type);
    }
    removeListener(listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
        this.layoutProcessors.removeListener(listenerSymbol);
    }
    dispatchPerformLayout(stage, ctx) {
        const result = this.layoutProcessors.reduceDispatch(stage, ({ shrinkRect }, ctx) => [Object.assign(Object.assign({}, ctx), { shrinkRect })], ctx);
        return result !== null && result !== void 0 ? result : ctx;
    }
    dispatchLayoutComplete(event) {
        this.listeners.dispatch('layout-complete', event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9sYXlvdXQvbGF5b3V0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUF5Q2pELFNBQVMsYUFBYSxDQUFDLENBQWE7SUFDaEMsT0FBTyxDQUFDLEtBQUssaUJBQWlCLENBQUM7QUFDbkMsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsQ0FBYTtJQUNuQyxPQUFPLENBQUMsS0FBSyxpQkFBaUIsQ0FBQztBQUNuQyxDQUFDO0FBRUQsTUFBTSxPQUFPLGFBQWE7SUFBMUI7UUFDcUIscUJBQWdCLEdBQUcsSUFBSSxTQUFTLEVBQWdDLENBQUM7UUFDakUsY0FBUyxHQUFHLElBQUksU0FBUyxFQUFxQyxDQUFDO0lBOEJwRixDQUFDO0lBNUJVLFdBQVcsQ0FBdUIsSUFBTyxFQUFFLEVBQWM7UUFDNUQsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDckIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFTLENBQUMsQ0FBQztTQUM3RDthQUFNLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBUyxDQUFDLENBQUM7U0FDdEQ7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFTSxjQUFjLENBQUMsY0FBc0I7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0scUJBQXFCLENBQUMsS0FBa0IsRUFBRSxHQUFrQjtRQUMvRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUMvQyxLQUFLLEVBQ0wsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsaUNBQU0sR0FBRyxLQUFFLFVBQVUsSUFBRyxFQUNqRCxHQUFHLENBQ04sQ0FBQztRQUVGLE9BQU8sTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLEdBQUksR0FBRyxDQUFDO0lBQ3pCLENBQUM7SUFFTSxzQkFBc0IsQ0FBQyxLQUEwQjtRQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0NBQ0oifQ==