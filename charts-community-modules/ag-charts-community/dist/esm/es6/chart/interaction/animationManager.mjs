import { BaseManager } from './baseManager.mjs';
import { animate as baseAnimate, tween, } from '../../motion/animate.mjs';
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
