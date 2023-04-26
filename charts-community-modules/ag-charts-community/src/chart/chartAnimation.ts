import { ActionOnSet } from '../util/proxy';
import { BOOLEAN, Validate } from '../util/validation';
import { AnimationManager } from './interaction/animationManager';

export class ChartAnimation {
    @Validate(BOOLEAN)
    @ActionOnSet<ChartAnimation>({
        newValue(enabled: boolean) {
            if (enabled) {
                this.animationManager?.play();
            } else {
                this.animationManager?.stop();
            }
        },
    })
    public enabled = true;

    readonly animationManager?: AnimationManager;

    constructor(animationManager: AnimationManager) {
        this.animationManager = animationManager;
    }
}
