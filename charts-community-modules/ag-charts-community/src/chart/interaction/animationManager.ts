import { BaseManager } from './baseManager';
import * as Motion from '../../motion/motion';

type AnimationId = string;
type AnimationType = 'animation-frame';

interface AnimationEvent<AnimationType> {
    type: AnimationType;
    delta: number;
}

interface AnimationManyOptions<T> extends Omit<Motion.AnimationOptions<T>, 'from' | 'to' | 'onUpdate'> {
    onUpdate: (props: Array<T>) => void;
}

const DEBOUNCE_DELAY = 300;

export class AnimationManager extends BaseManager<AnimationType, AnimationEvent<AnimationType>> {
    private readonly states: Record<AnimationId, Motion.AnimationControls> = {};
    private debouncers: Record<AnimationId, number> = {};

    private updaters: Array<[AnimationId, FrameRequestCallback]> = [];

    private isPlaying = false;
    private requestId?: number;
    private lastTime?: number;

    public skipAnimations = false;

    public constructor() {
        super();
    }

    public play() {
        this.isPlaying = true;

        for (const id in this.states) {
            this.states[id].play();
        }

        this.requestAnimationFrame();
    }

    public pause() {
        this.isPlaying = false;
        if (this.requestId) cancelAnimationFrame(this.requestId);

        for (const id in this.states) {
            this.states[id].pause();
        }
    }

    public stop() {
        this.isPlaying = false;
        if (this.requestId) cancelAnimationFrame(this.requestId);

        for (const id in this.states) {
            this.states[id].stop();
        }
    }

    public debouncedAnimate<T>(id: AnimationId, opts: Motion.AnimationOptions<T>): Motion.AnimationControls {
        if (this.debouncers[id] && Date.now() - this.debouncers[id] < (opts.duration ?? DEBOUNCE_DELAY)) {
            return this.states[id];
        }

        this.debouncers[id] = Date.now();
        return this.animate(id, opts);
    }

    public animate<T>(id: AnimationId, opts: Motion.AnimationOptions<T>): Motion.AnimationControls {
        const optsExtra = {
            ...opts,
            autoplay: this.isPlaying ? opts.autoplay : false,
            driver: this.createDriver(id),
        };
        const controller = Motion.animate(optsExtra);

        if (this.states[id]) {
            this.states[id].stop();
            delete this.states[id];
        }

        this.states[id] = controller;

        return controller;
    }

    public animateMany<T>(
        id: AnimationId,
        props: Array<Pick<Motion.AnimationOptions<T>, 'from' | 'to'>>,
        opts: AnimationManyOptions<T>
    ): Motion.AnimationControls {
        const state = props.map((prop) => prop.from);

        const onUpdate = (index: number) => (v: T) => {
            state[index] = v;
            opts.onUpdate?.(state);
        };

        const drivers = props.map((prop, index) => {
            const inner_id = `${id}-${index}`;
            return this.animate(inner_id, { ...opts, ...prop, onUpdate: onUpdate(index) });
        });

        const controls = {
            get isPlaying() {
                return drivers.filter((driver) => driver.isPlaying).length > 0;
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

    public tween<T>(opts: Motion.TweenOptions<T>): Motion.TweenControls<T> {
        const id = `tween-${btoa(JSON.stringify(opts))}`;
        const optsExtra = {
            ...opts,
            driver: this.createDriver(id),
        };

        return Motion.tween(optsExtra);
    }

    private createDriver(id: AnimationId): Motion.Driver {
        return (update: (time: number) => void) => {
            return {
                start: () => {
                    this.updaters.push([id, update]);
                },
                stop: () => {
                    this.updaters = this.updaters.filter(([uid]) => uid !== id);
                },
                reset: () => {},
            };
        };
    }

    private requestAnimationFrame() {
        this.requestId = requestAnimationFrame((time) => {
            if (this.lastTime === undefined) this.lastTime = time;
            const delta = time - this.lastTime;
            this.lastTime = time;

            this.updaters.forEach(([_, update]) => {
                update(delta);
            });

            this.listeners.dispatch('animation-frame', { type: 'animation-frame', delta });

            this.requestAnimationFrame();
        });
    }
}
