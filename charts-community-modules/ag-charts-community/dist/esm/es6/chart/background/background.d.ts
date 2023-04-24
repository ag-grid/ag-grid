import { BaseModuleInstance, ModuleContext, ModuleInstance } from '../../util/module';
export declare class Background extends BaseModuleInstance implements ModuleInstance {
    private node;
    private rectNode;
    constructor(ctx: ModuleContext);
    update(): void;
    visible: boolean;
    fill: string | undefined;
    private onLayoutComplete;
}
