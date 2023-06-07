import { BaseManager } from './baseManager';
import { animate as baseAnimate, tween, } from '../../motion/animate';
const DEBOUNCE_DELAY = 300;
export class AnimationManager extends BaseManager {
    constructor(interactionManager) {
        super();
        this.controllers = {};
        this.debouncers = {};
        this.updaters = [];
        this.isPlaying = false;
        this.readyToPlay = false;
        this.skipAnimations = false;
        this.interactionManager = interactionManager;
        window.addEventListener('DOMContentLoaded', () => {
            this.readyToPlay = true;
        });
        // Fallback if `DOMContentLoaded` event is not fired, e.g. in an iframe
        setTimeout(() => {
            this.readyToPlay = true;
        }, 10);
    }
    play() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        for (const id in this.controllers) {
            this.controllers[id].play();
        }
        this.startAnimationCycle();
    }
    pause() {
        if (!this.isPlaying)
            return;
        this.isPlaying = false;
        this.cancelAnimationFrame();
        for (const id in this.controllers) {
            this.controllers[id].pause();
        }
    }
    stop() {
        this.isPlaying = false;
        this.cancelAnimationFrame();
        for (const id in this.controllers) {
            this.controllers[id].stop();
        }
    }
    animate(id, opts) {
        var _a, _b;
        const optsExtra = Object.assign(Object.assign({}, opts), { autoplay: this.isPlaying ? opts.autoplay : false, driver: this.createDriver(id, opts.disableInteractions) });
        const controller = baseAnimate(optsExtra);
        if (this.controllers[id]) {
            this.controllers[id].stop();
            delete this.controllers[id];
        }
        this.controllers[id] = controller;
        if (this.skipAnimations) {
            // Initialise the animation with the final values immediately and then stop the animation
            (_a = opts.onUpdate) === null || _a === void 0 ? void 0 : _a.call(opts, opts.to);
            controller.stop();
        }
        else {
            // Initialise the animation immediately without requesting a frame to prevent flashes
            (_b = opts.onUpdate) === null || _b === void 0 ? void 0 : _b.call(opts, opts.from);
        }
        return controller;
    }
    animateMany(id, props, opts) {
        const state = props.map((prop) => prop.from);
        let updateBatch = 0;
        let completeBatch = 0;
        const onUpdate = (index) => (v) => {
            var _a;
            state[index] = v;
            if (++updateBatch >= props.length) {
                (_a = opts.onUpdate) === null || _a === void 0 ? void 0 : _a.call(opts, state);
                updateBatch = 0;
            }
        };
        const onComplete = () => {
            var _a;
            if (++completeBatch >= props.length) {
                (_a = opts.onComplete) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        const drivers = props.map((prop, index) => {
            const inner_id = `${id}-${index}`;
            return this.animate(inner_id, Object.assign(Object.assign(Object.assign({}, opts), prop), { onUpdate: onUpdate(index), onComplete: onComplete }));
        });
        const controls = {
            get isPlaying() {
                return drivers.some((driver) => driver.isPlaying);
            },
            play() {
                drivers.forEach((driver) => driver.play());
                return controls;
            },
            pause() {
                drivers.forEach((driver) => driver.pause());
                return controls;
            },
            stop() {
                drivers.forEach((driver) => driver.stop());
                return controls;
            },
            reset() {
                drivers.forEach((driver) => driver.reset());
                return controls;
            },
        };
        return controls;
    }
    debouncedAnimate(id, opts) {
        var _a;
        if (this.debouncers[id] && Date.now() - this.debouncers[id] < ((_a = opts.duration) !== null && _a !== void 0 ? _a : DEBOUNCE_DELAY)) {
            return this.controllers[id];
        }
        this.debouncers[id] = Date.now();
        return this.animate(id, opts);
    }
    tween(opts) {
        const id = `tween-${btoa(JSON.stringify(opts))}`;
        const optsExtra = Object.assign(Object.assign({}, opts), { driver: this.createDriver(id) });
        return tween(optsExtra);
    }
    createDriver(id, disableInteractions) {
        return (update) => {
            return {
                start: () => {
                    this.updaters.push([id, update]);
                    if (this.requestId == null) {
                        this.startAnimationCycle();
                    }
                    if (disableInteractions) {
                        this.interactionManager.pause(`animation_${id}`);
                    }
                },
                stop: () => {
                    this.updaters = this.updaters.filter(([uid]) => uid !== id);
                    if (this.updaters.length <= 0) {
                        this.cancelAnimationFrame();
                    }
                    if (disableInteractions) {
                        this.interactionManager.resume(`animation_${id}`);
                    }
                },
                reset: () => { },
            };
        };
    }
    startAnimationCycle() {
        const frame = (time) => {
            this.requestId = requestAnimationFrame(frame);
            if (!this.readyToPlay) {
                return;
            }
            if (this.lastTime === undefined)
                this.lastTime = time;
            const deltaMs = time - this.lastTime;
            this.lastTime = time;
            this.updaters.forEach(([_, update]) => {
                update(deltaMs);
            });
            this.listeners.dispatch('animation-frame', { type: 'animation-frame', deltaMs });
        };
        this.requestId = requestAnimationFrame(frame);
    }
    cancelAnimationFrame() {
        if (!this.requestId)
            return;
        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9pbnRlcmFjdGlvbi9hbmltYXRpb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUMsT0FBTyxFQUNILE9BQU8sSUFBSSxXQUFXLEVBSXRCLEtBQUssR0FHUixNQUFNLHNCQUFzQixDQUFDO0FBa0I5QixNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFFM0IsTUFBTSxPQUFPLGdCQUFpQixTQUFRLFdBQW1FO0lBZXJHLFlBQVksa0JBQXNDO1FBQzlDLEtBQUssRUFBRSxDQUFDO1FBZkssZ0JBQVcsR0FBMkMsRUFBRSxDQUFDO1FBQ2xFLGVBQVUsR0FBZ0MsRUFBRSxDQUFDO1FBRTdDLGFBQVEsR0FBK0MsRUFBRSxDQUFDO1FBRTFELGNBQVMsR0FBRyxLQUFLLENBQUM7UUFHbEIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFJckIsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFLMUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBRTdDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFSCx1RUFBdUU7UUFDdkUsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFBSSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFFdEIsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMs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