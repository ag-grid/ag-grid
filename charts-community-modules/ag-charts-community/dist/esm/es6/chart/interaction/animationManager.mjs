var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { BaseManager } from './baseManager.mjs';
import { animate as baseAnimate, tween } from '../../motion/animate.mjs';
import { Logger } from '../../util/logger.mjs';
export class AnimationManager extends BaseManager {
    constructor(interactionManager) {
        super();
        this.controllers = {};
        this.throttles = {};
        this.throttleGroups = new Set();
        this.updaters = [];
        this.isPlaying = false;
        this.readyToPlay = false;
        this.defaultOptions = {};
        this.skipAnimations = false;
        this.debug = false;
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
        if (this.debug) {
            Logger.debug('AnimationManager.play()');
        }
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
        if (this.debug) {
            Logger.debug('AnimationManager.pause()');
        }
        for (const id in this.controllers) {
            this.controllers[id].pause();
        }
    }
    stop() {
        this.isPlaying = false;
        this.cancelAnimationFrame();
        if (this.debug) {
            Logger.debug('AnimationManager.stop()');
        }
        for (const id in this.controllers) {
            this.controllers[id].stop();
        }
    }
    reset() {
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
        else {
            this.stop();
        }
    }
    animate(id, _a) {
        var _b, _c;
        var { disableInteractions = true } = _a, opts = __rest(_a, ["disableInteractions"]);
        if (this.skipAnimations) {
            // Initialise the animation with the final values immediately and then stop the animation
            (_b = opts.onUpdate) === null || _b === void 0 ? void 0 : _b.call(opts, opts.to);
            return;
        }
        const optsExtra = Object.assign(Object.assign({}, opts), { autoplay: this.isPlaying ? opts.autoplay : false, driver: this.createDriver(id, disableInteractions) });
        if (this.controllers[id]) {
            this.controllers[id].stop();
        }
        const controller = baseAnimate(optsExtra);
        this.controllers[id] = controller;
        // Initialise the animation immediately without requesting a frame to prevent flashes
        (_c = opts.onUpdate) === null || _c === void 0 ? void 0 : _c.call(opts, opts.from);
        return controller;
    }
    animateMany(id, props, opts) {
        var _a;
        if (this.skipAnimations) {
            const state = props.map((prop) => prop.to);
            opts.onUpdate(state);
            (_a = opts.onComplete) === null || _a === void 0 ? void 0 : _a.call(opts);
            return;
        }
        const state = props.map((prop) => prop.from);
        let playBatch = 0;
        let stopBatch = 0;
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
        const onPlay = () => {
            var _a;
            if (++playBatch >= props.length) {
                (_a = opts.onPlay) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        const onStop = () => {
            var _a;
            if (++stopBatch >= props.length) {
                (_a = opts.onStop) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        const onComplete = () => {
            var _a;
            if (++completeBatch >= props.length) {
                (_a = opts.onComplete) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        let index = 0;
        for (const prop of props) {
            const inner_id = `${id}-${index}`;
            this.animate(inner_id, Object.assign(Object.assign(Object.assign({}, opts), prop), { onUpdate: onUpdate(index), onPlay,
                onStop,
                onComplete }));
            index++;
        }
    }
    animateWithThrottle(id, opts) {
        var _a;
        const throttleId = (_a = opts.throttleId) !== null && _a !== void 0 ? _a : id;
        if (this.throttles[throttleId] && opts.duration && Date.now() - this.throttles[throttleId] < opts.duration) {
            opts.delay = 0;
            opts.duration = 1;
        }
        this.throttles[id] = Date.now();
        this.animate(id, Object.assign({}, opts));
    }
    animateManyWithThrottle(id, props, opts) {
        var _a;
        const { throttleGroup } = opts;
        const throttleId = (_a = opts.throttleId) !== null && _a !== void 0 ? _a : id;
        const now = Date.now();
        const isThrottled = this.throttles[throttleId] && opts.duration && now - this.throttles[throttleId] < opts.duration;
        const inGroup = throttleGroup && this.throttleGroups.has(throttleGroup);
        if (isThrottled && !inGroup) {
            opts.delay = 0;
            opts.duration = 1;
        }
        if (!isThrottled && throttleGroup) {
            this.throttleGroups.add(throttleGroup);
        }
        const onStop = () => {
            var _a;
            if (throttleGroup) {
                this.throttleGroups.delete(throttleGroup);
            }
            (_a = opts.onStop) === null || _a === void 0 ? void 0 : _a.call(opts);
        };
        this.throttles[throttleId] = now;
        return this.animateMany(id, props, Object.assign(Object.assign({}, opts), { onStop }));
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
                    delete this.controllers[id];
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
        if (this.updaters.length === 0)
            return;
        const frame = (time) => {
            this.requestId = requestAnimationFrame(frame);
            if (!this.readyToPlay)
                return;
            if (this.lastTime === undefined)
                this.lastTime = time;
            const deltaMs = time - this.lastTime;
            this.lastTime = time;
            if (this.debug) {
                Logger.debug('AnimationManager - frame()', { updaterCount: this.updaters.length });
            }
            this.updaters.forEach(([_, update]) => update(deltaMs));
            this.listeners.dispatch('animation-frame', { type: 'animation-frame', deltaMs });
        };
        this.requestId = requestAnimationFrame(frame);
    }
    cancelAnimationFrame() {
        if (!this.requestId)
            return;
        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
        this.lastTime = undefined;
    }
}
