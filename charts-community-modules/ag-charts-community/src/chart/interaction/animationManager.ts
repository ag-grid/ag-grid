import { BaseManager } from './baseManager';
import * as Motion from '../../motion/motion';

type AnimationId = string;
type AnimationType = 'animation-frame';

interface AnimationEvent<AnimationType> {
    type: AnimationType;
    delta: number;
}

export class AnimationManager extends BaseManager<AnimationType, AnimationEvent<AnimationType>> {
    private readonly states: Record<AnimationId, Motion.AnimationControls> = {};

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

    public animate<T>(id: AnimationId, opts: Motion.AnimationOptions<T>) {
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

    private createDriver(id: AnimationId): Motion.Driver {
        return (update: (time: number) => void) => {
            return {
                start: () => {
                    this.updaters.push([id, update]);
                },
                stop: () => {
                    this.updaters.filter(([uid]) => uid !== id);
                },
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
