"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = void 0;
var logger_1 = require("../util/logger");
var window_1 = require("../util/window");
var StateMachine = /** @class */ (function () {
    function StateMachine(initialState, states) {
        this.state = initialState;
        this.states = states;
        if (StateMachine.DEBUG())
            logger_1.Logger.debug("%c" + this.constructor.name + " | init -> " + initialState, 'color: green');
    }
    StateMachine.prototype.transition = function (event, data) {
        var _a, _b, _c, _d, _e;
        var currentStateConfig = this.states[this.state];
        var destinationTransition = (_a = currentStateConfig === null || currentStateConfig === void 0 ? void 0 : currentStateConfig.on) === null || _a === void 0 ? void 0 : _a[event];
        if (!destinationTransition) {
            if (StateMachine.DEBUG()) {
                logger_1.Logger.debug("%c" + this.constructor.name + " | " + this.state + " -> " + event + " -> " + this.state, 'color: grey');
            }
            return;
        }
        var destinationState = destinationTransition.target;
        var destinationStateConfig = this.states[destinationState];
        if (StateMachine.DEBUG()) {
            logger_1.Logger.debug("%c" + this.constructor.name + " | " + this.state + " -> " + event + " -> " + destinationState, 'color: green');
        }
        destinationTransition.action(data);
        (_c = (_b = currentStateConfig === null || currentStateConfig === void 0 ? void 0 : currentStateConfig.actions) === null || _b === void 0 ? void 0 : _b.onExit) === null || _c === void 0 ? void 0 : _c.call(_b);
        (_e = (_d = destinationStateConfig === null || destinationStateConfig === void 0 ? void 0 : destinationStateConfig.actions) === null || _d === void 0 ? void 0 : _d.onEnter) === null || _e === void 0 ? void 0 : _e.call(_d);
        this.state = destinationState;
        return this.state;
    };
    StateMachine.DEBUG = function () { var _a; return (_a = [true, 'animation'].includes(window_1.windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };
    return StateMachine;
}());
exports.StateMachine = StateMachine;
//# sourceMappingURL=states.js.map