import { _ModuleSupport, _Scene } from 'ag-charts-community';

const { BOOLEAN, ActionOnSet, Validate } = _ModuleSupport;

export class Animation extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    @Validate(BOOLEAN)
    @ActionOnSet<Animation>({
        newValue(value: boolean) {
            if (!this.animationManager) return;
            this.animationManager.skipAnimations = !value;
        },
    })
    public enabled = true;

    animationManager: _ModuleSupport.AnimationManager;

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();
        this.animationManager = ctx.animationManager;

        // TODO: why is newValue called before the constructor??
        this.animationManager.skipAnimations = false;
    }
}
