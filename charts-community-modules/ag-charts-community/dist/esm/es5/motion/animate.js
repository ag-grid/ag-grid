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
import { linear } from './easing';
export var RepeatType;
(function (RepeatType) {
    RepeatType["Loop"] = "loop";
    RepeatType["Reverse"] = "reverse";
})(RepeatType || (RepeatType = {}));
export function animate(_a) {
    var driver = _a.driver, duration = _a.duration, from = _a.from, to = _a.to, _b = _a.autoplay, autoplay = _b === void 0 ? true : _b, _c = _a.delay, delay = _c === void 0 ? 0 : _c, _d = _a.ease, ease = _d === void 0 ? linear : _d, _e = _a.repeat, repeatMax = _e === void 0 ? Infinity : _e, _f = _a.repeatType, repeatType = _f === void 0 ? RepeatType.Loop : _f, onComplete = _a.onComplete, onPlay = _a.onPlay, onRepeat = _a.onRepeat, onStop = _a.onStop, onUpdate = _a.onUpdate;
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
export function tween(opts) {
    var handleUpdate;
    var animateOpts = __assign(__assign({}, opts), { repeat: 0, autoplay: false, onUpdate: function (value) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tb3Rpb24vYW5pbWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBVSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFTMUMsTUFBTSxDQUFOLElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNsQiwyQkFBYSxDQUFBO0lBQ2IsaUNBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQUhXLFVBQVUsS0FBVixVQUFVLFFBR3JCO0FBK0JELE1BQU0sVUFBVSxPQUFPLENBQWEsRUFlZDtRQWRsQixNQUFNLFlBQUEsRUFDTixRQUFRLGNBQUEsRUFDUixJQUFJLFVBQUEsRUFDSixFQUFFLFFBQUEsRUFDRixnQkFBZSxFQUFmLFFBQVEsbUJBQUcsSUFBSSxLQUFBLEVBQ2YsYUFBUyxFQUFULEtBQUssbUJBQUcsQ0FBQyxLQUFBLEVBQ1QsWUFBYSxFQUFiLElBQUksbUJBQUcsTUFBTSxLQUFBLEVBQ2IsY0FBNEIsRUFBcEIsU0FBUyxtQkFBRyxRQUFRLEtBQUEsRUFDNUIsa0JBQTRCLEVBQTVCLFVBQVUsbUJBQUcsVUFBVSxDQUFDLElBQUksS0FBQSxFQUM1QixVQUFVLGdCQUFBLEVBQ1YsTUFBTSxZQUFBLEVBQ04sUUFBUSxjQUFBLEVBQ1IsTUFBTSxZQUFBLEVBQ04sUUFBUSxjQUFBO0lBRVIsSUFBSSxLQUFRLENBQUM7SUFDYixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDckIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDckIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBRXZCLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBQSxFQUFFLENBQUMsQ0FBQztJ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