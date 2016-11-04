import { AnimationPlayer } from '../private_import_core';
export declare class WebAnimationsPlayer implements AnimationPlayer {
    element: any;
    keyframes: {
        [key: string]: string | number;
    }[];
    options: {
        [key: string]: string | number;
    };
    private _onDoneFns;
    private _onStartFns;
    private _finished;
    private _initialized;
    private _player;
    private _started;
    private _duration;
    parentPlayer: AnimationPlayer;
    constructor(element: any, keyframes: {
        [key: string]: string | number;
    }[], options: {
        [key: string]: string | number;
    });
    private _onFinish();
    init(): void;
    onStart(fn: () => void): void;
    onDone(fn: () => void): void;
    play(): void;
    pause(): void;
    finish(): void;
    reset(): void;
    restart(): void;
    hasStarted(): boolean;
    destroy(): void;
    totalTime: number;
    setPosition(p: number): void;
    getPosition(): number;
}
