import { linear } from './easing.mjs';
export var RepeatType;
(function (RepeatType) {
    RepeatType["Loop"] = "loop";
    RepeatType["Reverse"] = "reverse";
})(RepeatType || (RepeatType = {}));
export function animate({ driver, duration, from, to, autoplay = true, delay = 0, ease = linear, repeat: repeatMax = 0, repeatType = RepeatType.Loop, onComplete, onPlay, onRepeat, onStop, onUpdate, }) {
    let state;
    let delayElapsed = 0;
    let elapsed = 0;
    let iteration = 0;
    let isForward = true;
    let isComplete = false;
    const easing = ease({ from, to });
    const controls = { isPlaying: false, play, pause, stop, reset };
    const driverControls = driver(update);
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
    let handleUpdate;
    const animateOpts = Object.assign(Object.assign({}, opts), { autoplay: false, onUpdate: (value) => {
            handleUpdate === null || handleUpdate === void 0 ? void 0 : handleUpdate(value);
        } });
    const animationControls = animate(animateOpts);
    const controls = {
        start: (onUpdate) => {
            animationControls.stop();
            animationControls.reset();
            animationControls.play();
            handleUpdate = onUpdate;
            return controls;
        },
        stop: () => {
            animationControls.stop();
            return controls;
        },
    };
    return controls;
}
