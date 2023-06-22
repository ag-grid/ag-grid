import { _ModuleSupport, _Scene } from 'ag-charts-community';

const { BOOLEAN, NUMBER, ActionOnSet, Validate } = _ModuleSupport;

export class Animation extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    @Validate(BOOLEAN)
    @ActionOnSet<Animation>({
        newValue(value: boolean) {
            if (!this.animationManager) return;
            this.animationManager.skipAnimations = !value;
        },
    })
    public enabled = true;

    @Validate(NUMBER(0))
    @ActionOnSet<Animation>({
        newValue(value: number | undefined) {
            if (!this.animationManager) return;
            this.animationManager.defaultOptions.duration = value;
        },
    })
    public duration?: number;

    animationManager: _ModuleSupport.AnimationManager;

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();
        this.animationManager = ctx.animationManager;
        this.animationManager.skipAnimations = false;
    }
}
