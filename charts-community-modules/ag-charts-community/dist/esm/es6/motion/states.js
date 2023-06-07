import { Logger } from '../util/logger';
export class StateMachine {
    constructor(initialState, states) {
        this.debug = false;
        this.state = initialState;
        this.states = states;
        if (this.debug)
            Logger.debug(`%c${this.constructor.name} | init -> ${initialState}`, 'color: green');
    }
    transition(event, data) {
        var _a, _b, _c, _d, _e;
        const currentStateConfig = this.states[this.state];
        const destinationTransition = (_a = currentStateConfig === null || currentStateConfig === void 0 ? void 0 : currentStateConfig.on) === null || _a === void 0 ? void 0 : _a[event];
        if (!destinationTransition) {
            if (this.debug) {
                Logger.debug(`%c${this.constructor.name} | ${this.state} -> ${event} -> ${this.state}`, 'color: grey');
            }
            return;
        }
        const destinationState = destinationTransition.target;
        const destinationStateConfig = this.states[destinationState];
        if (this.debug) {
            Logger.debug(`%c${this.constructor.name} | ${this.state} -> ${event} -> ${destinationState}`, 'color: green');
        }
        destinationTransition.action(data);
        (_c = (_b = currentStateConfig === null || currentStateConfig === void 0 ? void 0 : currentStateConfig.actions) === null || _b === void 0 ? void 0 : _b.onExit) === null || _c === void 0 ? void 0 : _c.call(_b);
        (_e = (_d = destinationStateConfig === null || destinationStateConfig === void 0 ? void 0 : destinationStateConfig.actions) === null || _d === void 0 ? void 0 : _d.onEnter) === null || _e === void 0 ? void 0 : _e.call(_d);
        this.state = destinationState;
        return this.state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21vdGlvbi9zdGF0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZXhDLE1BQU0sT0FBTyxZQUFZO0lBTXJCLFlBQVksWUFBbUIsRUFBRSxNQUFvRDtRQUZyRixVQUFLLEdBQUcsS0FBSyxDQUFDO1FBR1YsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxJQUFJLENBQUMsS0FBSztZQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksY0FBYyxZQUFZLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN6RyxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQVksRUFBRSxJQUFVOztRQUMvQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELE1BQU0scUJBQXFCLEdBQUcsTUFBQSxrQkFBa0IsYUFBbEIsa0JBQWtCLHVCQUFsQixrQkFBa0IsQ0FBRSxFQUFFLDBDQUFHLEtBQUssQ0FBQyxDQUFDO1FBRTlELElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUN4QixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxLQUFLLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUMxRztZQUNELE9BQU87U0FDVjtRQUVELE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDO1FBQ3RELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTdELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNaLE1BQU0sQ0FBQyxLQUFLLENBQ1IsS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksTUFBTSxJQUFJLENBQUMsS0FBSyxPQUFPLEtBQUssT0FBTyxnQkFBZ0IsRUFBRSxFQUMvRSxjQUFjLENBQ2pCLENBQUM7U0FDTDtRQUVELHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxNQUFBLE1BQUEsa0JBQWtCLGFBQWxCLGtCQUFrQix1QkFBbEIsa0JBQWtCLENBQUUsT0FBTywwQ0FBRSxNQUFNLGtEQUFJLENBQUM7UUFDeEMsTUFBQSxNQUFBLHNCQUFzQixhQUF0QixzQkFBc0IsdUJBQXRCLHNCQUFzQixDQUFFLE9BQU8sMENBQUUsT0FBTyxrREFBSSxDQUFDO1FBRTdDLElBQUksQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7UUFFOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7Q0FDSiJ9