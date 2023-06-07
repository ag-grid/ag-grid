import { Logger } from '../util/logger';
var StateMachine = /** @class */ (function () {
    function StateMachine(initialState, states) {
        this.debug = false;
        this.state = initialState;
        this.states = states;
        if (this.debug)
            Logger.debug("%c" + this.constructor.name + " | init -> " + initialState, 'color: green');
    }
    StateMachine.prototype.transition = function (event, data) {
        var _a, _b, _c, _d, _e;
        var currentStateConfig = this.states[this.state];
        var destinationTransition = (_a = currentStateConfig === null || currentStateConfig === void 0 ? void 0 : currentStateConfig.on) === null || _a === void 0 ? void 0 : _a[event];
        if (!destinationTransition) {
            if (this.debug) {
                Logger.debug("%c" + this.constructor.name + " | " + this.state + " -> " + event + " -> " + this.state, 'color: grey');
            }
            return;
        }
        var destinationState = destinationTransition.target;
        var destinationStateConfig = this.states[destinationState];
        if (this.debug) {
            Logger.debug("%c" + this.constructor.name + " | " + this.state + " -> " + event + " -> " + destinationState, 'color: green');
        }
        destinationTransition.action(data);
        (_c = (_b = currentStateConfig === null || currentStateConfig === void 0 ? void 0 : currentStateConfig.actions) === null || _b === void 0 ? void 0 : _b.onExit) === null || _c === void 0 ? void 0 : _c.call(_b);
        (_e = (_d = destinationStateConfig === null || destinationStateConfig === void 0 ? void 0 : destinationStateConfig.actions) === null || _d === void 0 ? void 0 : _d.onEnter) === null || _e === void 0 ? void 0 : _e.call(_d);
        this.state = destinationState;
        return this.state;
    };
    return StateMachine;
}());
export { StateMachine };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21vdGlvbi9zdGF0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBZXhDO0lBTUksc0JBQVksWUFBbUIsRUFBRSxNQUFvRDtRQUZyRixVQUFLLEdBQUcsS0FBSyxDQUFDO1FBR1YsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxJQUFJLENBQUMsS0FBSztZQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksbUJBQWMsWUFBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFFRCxpQ0FBVSxHQUFWLFVBQVcsS0FBWSxFQUFFLElBQVU7O1FBQy9CLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBTSxxQkFBcUIsR0FBRyxNQUFBLGtCQUFrQixhQUFsQixrQkFBa0IsdUJBQWxCLGtCQUFrQixDQUFFLEVBQUUsMENBQUcsS0FBSyxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQ3hCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQU0sSUFBSSxDQUFDLEtBQUssWUFBTyxLQUFLLFlBQU8sSUFBSSxDQUFDLEtBQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzthQUMxRztZQUNELE9BQU87U0FDVjtRQUVELElBQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDO1FBQ3RELElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTdELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNaLE1BQU0sQ0FBQyxLQUFLLENBQ1IsT0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksV0FBTSxJQUFJLENBQUMsS0FBSyxZQUFPLEtBQUssWUFBTyxnQkFBa0IsRUFDL0UsY0FBYyxDQUNqQixDQUFDO1NBQ0w7UUFFRCxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsTUFBQSxNQUFBLGtCQUFrQixhQUFsQixrQkFBa0IsdUJBQWxCLGtCQUFrQixDQUFFLE9BQU8sMENBQUUsTUFBTSxrREFBSSxDQUFDO1FBQ3hDLE1BQUEsTUFBQSxzQkFBc0IsYUFBdEIsc0JBQXNCLHVCQUF0QixzQkFBc0IsQ0FBRSxPQUFPLDBDQUFFLE9BQU8sa0RBQUksQ0FBQztRQUU3QyxJQUFJLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDO1FBRTlCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQUFDLEFBMUNELElBMENDIn0=