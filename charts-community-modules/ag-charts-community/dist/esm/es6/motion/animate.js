import { linear } from './easing';
export var RepeatType;
(function (RepeatType) {
    RepeatType["Loop"] = "loop";
    RepeatType["Reverse"] = "reverse";
})(RepeatType || (RepeatType = {}));
export function animate({ driver, duration, from, to, autoplay = true, delay = 0, ease = linear, repeat: repeatMax = Infinity, repeatType = RepeatType.Loop, onComplete, onPlay, onRepeat, onStop, onUpdate, }) {
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
    const animateOpts = Object.assign(Object.assign({}, opts), { repeat: 0, autoplay: false, onUpdate: (value) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tb3Rpb24vYW5pbWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBUzFDLE1BQU0sQ0FBTixJQUFZLFVBR1g7QUFIRCxXQUFZLFVBQVU7SUFDbEIsMkJBQWEsQ0FBQTtJQUNiLGlDQUFtQixDQUFBO0FBQ3ZCLENBQUMsRUFIVyxVQUFVLEtBQVYsVUFBVSxRQUdyQjtBQStCRCxNQUFNLFVBQVUsT0FBTyxDQUFhLEVBQ2hDLE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxFQUNKLEVBQUUsRUFDRixRQUFRLEdBQUcsSUFBSSxFQUNmLEtBQUssR0FBRyxDQUFDLEVBQ1QsSUFBSSxHQUFHLE1BQU0sRUFDYixNQUFNLEVBQUUsU0FBUyxHQUFHLFFBQVEsRUFDNUIsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQzVCLFVBQVUsRUFDVixNQUFNLEVBQ04sUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEdBQ1U7SUFDbEIsSUFBSSxLQUFRLENBQUM7SUFDYixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDckIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDckIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBRXZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sUUFBUSxHQUFzQixFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbkYsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXRD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