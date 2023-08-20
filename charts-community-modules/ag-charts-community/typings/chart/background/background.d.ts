import type { ModuleInstance } from '../../util/module';
import { BaseModuleInstance } from '../../util/module';
import type { ModuleContext } from '../../util/moduleContext';
export declare class Background extends BaseModuleInstance implements ModuleInstance {
    private node;
    private rectNode;
    constructor(ctx: ModuleContext);
    visible: boolean;
    fill: string | undefined;
    private onLayoutComplete;
}
//# sourceMappingURL=background.d.ts.map