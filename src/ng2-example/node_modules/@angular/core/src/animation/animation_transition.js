import { AnimationTransitionEvent } from './animation_transition_event';
export var AnimationTransition = (function () {
    function AnimationTransition(_player, _fromState, _toState, _totalTime) {
        this._player = _player;
        this._fromState = _fromState;
        this._toState = _toState;
        this._totalTime = _totalTime;
    }
    AnimationTransition.prototype._createEvent = function (phaseName) {
        return new AnimationTransitionEvent({
            fromState: this._fromState,
            toState: this._toState,
            totalTime: this._totalTime,
            phaseName: phaseName
        });
    };
    AnimationTransition.prototype.onStart = function (callback) {
        var event = this._createEvent('start');
        this._player.onStart(function () { return callback(event); });
    };
    AnimationTransition.prototype.onDone = function (callback) {
        var event = this._createEvent('done');
        this._player.onDone(function () { return callback(event); });
    };
    return AnimationTransition;
}());
//# sourceMappingURL=animation_transition.js.map