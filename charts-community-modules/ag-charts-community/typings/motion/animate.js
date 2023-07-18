"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tween = exports.animate = exports.RepeatType = void 0;
var easing_1 = require("./easing");
var RepeatType;
(function (RepeatType) {
    RepeatType["Loop"] = "loop";
    RepeatType["Reverse"] = "reverse";
})(RepeatType = exports.RepeatType || (exports.RepeatType = {}));
function animate(_a) {
    var driver = _a.driver, duration = _a.duration, from = _a.from, to = _a.to, _b = _a.autoplay, autoplay = _b === void 0 ? true : _b, _c = _a.delay, delay = _c === void 0 ? 0 : _c, _d = _a.ease, ease = _d === void 0 ? easing_1.linear : _d, _e = _a.repeat, repeatMax = _e === void 0 ? 0 : _e, _f = _a.repeatType, repeatType = _f === void 0 ? RepeatType.Loop : _f, onComplete = _a.onComplete, onPlay = _a.onPlay, onRepeat = _a.onRepeat, onStop = _a.onStop, onUpdate = _a.onUpdate;
    var state;
    var delayElapsed = 0;
    var elapsed = 0;
    var iteration = 0;
    var isForward = true;
    var isComplete = false;
    var easing = ease({ from: from, to: to });
    var controls = { isPlaying: false, play: play, pause: pause, stop: stop, reset: reset };
    var driverControls = driver(update);
    function play() {
        controls.isPlaying = true;
        driverControls.start();
        onPlay === null || onPlay === void 0 ? void 0 : onPlay();
        return controls;
    }
    function pause() {
        controls.isPlaying = false;
        return controls;
    }
    function stop() {
        controls.isPlaying = false;
        driverControls.stop();
        onStop === null || onStop === void 0 ? void 0 : onStop();
        return controls;
    }
    function reset() {
        isComplete = false;
        elapsed = 0;
        iteration = 0;
        driverControls.reset();
        return controls;
    }
    function repeat() {
        iteration++;
        if (repeatType === RepeatType.Reverse) {
            isForward = iteration % 2 === 0;
            elapsed = isForward ? elapsed % duration : duration - (elapsed % duration);
        }
        else {
            elapsed = elapsed % duration;
        }
        isComplete = false;
        onRepeat === null || onRepeat === void 0 ? void 0 : onRepeat();
    }
    function complete() {
        stop();
        onComplete === null || onComplete === void 0 ? void 0 : onComplete();
    }
    function update(delta) {
        if (!isForward)
            delta = -delta;
        if (delayElapsed >= delay) {
            elapsed += delta;
        }
        else {
            delayElapsed += delta;
            return;
        }
        if (!isComplete) {
            state = easing(Math.min(1, Math.max(0, elapsed / duration)));
            isComplete = isForward ? elapsed >= duration : elapsed <= 0;
        }
        onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate(state);
        if (isComplete) {
            if (iteration < repeatMax) {
                repeat();
            }
            else {
                complete();
            }
        }
    }
    if (autoplay)
        play();
    return controls;
}
exports.animate = animate;
function tween(opts) {
    var handleUpdate;
    var animateOpts = __assign(__assign({}, opts), { autoplay: false, onUpdate: function (value) {
            handleUpdate === null || handleUpdate === void 0 ? void 0 : handleUpdate(value);
        } });
    var animationControls = animate(animateOpts);
    var controls = {
        start: function (onUpdate) {
            animationControls.stop();
            animationControls.reset();
            animationControls.play();
            handleUpdate = onUpdate;
            return controls;
        },
        stop: function () {
            animationControls.stop();
            return controls;
        },
    };
    return controls;
}
exports.tween = tween;
//# sourceMappingURL=animate.js.map