import { BaseManager } from './baseManager';
import type { InteractionManager } from './interactionManager';
import type {
    AnimationControls,
    AnimationOptions as BaseAnimationOptions,
    Driver,
    TweenControls,
    TweenOptions,
} from '../../motion/animate';
import { animate as baseAnimate, tween } from '../../motion/animate';
import { Logger } from '../../util/logger';

type AnimationId = string;
type AnimationEventType = 'animation-frame';

interface AnimationEvent<AnimationEventType> {
    type: AnimationEventType;
    deltaMs: number;
}

interface AnimationOptions<T> extends Omit<BaseAnimationOptions<T>, 'driver'> {
    disableInteractions?: boolean;
}

interface AnimationManyOptions<T> extends Omit<AnimationOptions<T>, 'from' | 'to' | 'onUpdate'> {
    onUpdate: (props: Array<T>) => void;
}

interface AnimationThrottleOptions {
    // Animations that share this throttleId will cause each other to be throttled if triggered within the duration of
    // a previous animation.
    throttleId?: string;

    // Animations within a throttleGroup will not cause each other to be throttled. Used in combination with a
    // throttleId this allows batches of animations to run normally but throttle later batches.
    throttleGroup?: string;
}

export class AnimationManager extends BaseManager<AnimationEventType, AnimationEvent<AnimationEventType>> {
    private readonly controllers: Record<AnimationId, AnimationControls> = {};
    private throttles: Record<string, number> = {};
    private throttleGroups: Set<string> = new Set();

    private updaters: Array<[AnimationId, FrameRequestCallback]> = [];

    private isPlaying = false;
    private requestId?: number;
    private lastTime?: number;
    private readyToPlay = false;

    private interactionManager: InteractionManager;

    public defaultOptions: Partial<Pick<AnimationOptions<any>, 'duration'>> = {};
    public skipAnimations = false;
    public debug = false;

    constructor(interactionManager: InteractionManager) {
        super();

        this.interactionManager = interactionManager;

        window.addEventListener('DOMContentLoaded', () => {
            this.readyToPlay = true;
        });

        // Fallback if `DOMContentLoaded` event is not fired, e.g. in an iframe
        setTimeout(() => {
            this.readyToPlay = true;
        }, 10);
    }

    public play() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        if (this.debug) {
            Logger.debug('AnimationManager.play()');
        }

        for (const id in this.controllers) {
            this.controllers[id].play();
        }

        this.startAnimationCycle();
    }

    public pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.cancelAnimationFrame();

        if (this.debug) {
            Logger.debug('AnimationManager.pause()');
        }

        for (const id in this.controllers) {
            this.controllers[id].pause();
        }
    }

    public stop() {
        this.isPlaying = false;
        this.cancelAnimationFrame();

        if (this.debug) {
            Logger.debug('AnimationManager.stop()');
        }

        for (const id in this.controllers) {
            this.controllers[id].stop();
        }
    }

    public reset() {
        if (this.isPlaying) {
            this.stop();
            this.play();
        } else {
            this.stop();
        }
    }

    public animate<T>(
        id: AnimationId,
        { disableInteractions = true, ...opts }: AnimationOptions<T>
    ): AnimationControls {
        const optsExtra = {
            ...opts,
            autoplay: this.isPlaying ? opts.autoplay : false,
            driver: this.createDriver(id, disableInteractions),
        };

        if (this.controllers[id]) {
            this.controllers[id].stop();
        }

        const controller = baseAnimate(optsExtra);
        this.controllers[id] = controller;

        if (this.skipAnimations) {
            // Initialise the animation with the final values immediately and then stop the animation
            opts.onUpdate?.(opts.to);
            controller.stop();
        } else {
            // Initialise the animation immediately without requesting a frame to prevent flashes
            opts.onUpdate?.(opts.from);
        }

        return controller;
    }

    public animateMany<T>(
        id: AnimationId,
        props: Array<Pick<AnimationOptions<T>, 'from' | 'to'>>,
        opts: AnimationManyOptions<T>
    ): AnimationControls {
        const state = props.map((prop) => prop.from);

        let playBatch = 0;
        let stopBatch = 0;
        let updateBatch = 0;
        let completeBatch = 0;

        const onUpdate = (index: number) => (v: T) => {
            state[index] = v;
            if (++updateBatch >= props.length) {
                opts.onUpdate?.(state);
                updateBatch = 0;
            }
        };

        const onPlay = () => {
            if (++playBatch >= props.length) {
                opts.onPlay?.();
            }
        };

        const onStop = () => {
            if (++stopBatch >= props.length) {
                opts.onStop?.();
            }
        };

        const onComplete = () => {
            if (++completeBatch >= props.length) {
                opts.onComplete?.();
            }
        };

        const drivers = props.map((prop, index) => {
            const inner_id = `${id}-${index}`;
            return this.animate(inner_id, {
                ...opts,
                ...prop,
                onUpdate: onUpdate(index),
                onPlay,
                onStop,
                onComplete,
            });
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

    public animateWithThrottle<T>(
        id: AnimationId,
        opts: AnimationOptions<T> & AnimationThrottleOptions
    ): AnimationControls {
        const throttleId = opts.throttleId ?? id;

        if (this.throttles[throttleId] && opts.duration && Date.now() - this.throttles[throttleId] < opts.duration) {
            opts.delay = 0;
            opts.duration = 1;
        }

        this.throttles[id] = Date.now();
        return this.animate(id, { ...opts });
    }

    public animateManyWithThrottle<T>(
        id: AnimationId,
        props: Array<Pick<AnimationOptions<T>, 'from' | 'to'>>,
        opts: AnimationManyOptions<T> & AnimationThrottleOptions
    ): AnimationControls {
        const { throttleGroup } = opts;
        const throttleId = opts.throttleId ?? id;

        const now = Date.now();

        const isThrottled =
            this.throttles[throttleId] && opts.duration && now - this.throttles[throttleId] < opts.duration;
        const inGroup = throttleGroup && this.throttleGroups.has(throttleGroup);

        if (isThrottled && !inGroup) {
            opts.delay = 0;
            opts.duration = 1;
        }

        if (!isThrottled && throttleGroup) {
            this.throttleGroups.add(throttleGroup);
        }

        const onStop = () => {
            if (throttleGroup) {
                this.throttleGroups.delete(throttleGroup);
            }
            opts.onStop?.();
        };

        this.throttles[throttleId] = now;

        return this.animateMany(id, props, { ...opts, onStop });
    }

    public tween<T>(opts: TweenOptions<T>): TweenControls<T> {
        const id = `tween-${btoa(JSON.stringify(opts))}`;
        const optsExtra = {
            ...opts,
            driver: this.createDriver(id),
        };

        return tween(optsExtra);
    }

    private createDriver(id: AnimationId, disableInteractions?: boolean): Driver {
        return (update: (time: number) => void) => {
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
                reset: () => {},
            };
        };
    }

    private startAnimationCycle() {
        if (this.updaters.length === 0) return;

        const frame = (time: number) => {
            this.requestId = requestAnimationFrame(frame);

            if (!this.readyToPlay) return;

            if (this.lastTime === undefined) this.lastTime = time;
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

    private cancelAnimationFrame() {
        if (!this.requestId) return;

        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
        this.lastTime = undefined;
    }
}
