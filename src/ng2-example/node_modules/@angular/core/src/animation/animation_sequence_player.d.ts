import { AnimationPlayer } from './animation_player';
export declare class AnimationSequencePlayer implements AnimationPlayer {
    private _players;
    private _currentIndex;
    private _activePlayer;
    private _onDoneFns;
    private _onStartFns;
    private _finished;
    private _started;
    parentPlayer: AnimationPlayer;
    constructor(_players: AnimationPlayer[]);
    private _onNext(start);
    private _onFinish();
    init(): void;
    onStart(fn: () => void): void;
    onDone(fn: () => void): void;
    hasStarted(): boolean;
    play(): void;
    pause(): void;
    restart(): void;
    reset(): void;
    finish(): void;
    destroy(): void;
    setPosition(p: any): void;
    getPosition(): number;
}
