import { AnimationPlayer } from '../animation/animation_player';
export declare class AnimationViewContext {
    private _players;
    onAllActiveAnimationsDone(callback: () => any): void;
    queueAnimation(element: any, animationName: string, player: AnimationPlayer): void;
    cancelActiveAnimation(element: any, animationName: string, removeAllAnimations?: boolean): void;
}
