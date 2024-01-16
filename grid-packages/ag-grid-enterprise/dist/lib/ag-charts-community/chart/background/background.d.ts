import type { ModuleInstance } from '../../module/baseModule';
import { BaseModuleInstance } from '../../module/module';
import type { ModuleContext } from '../../module/moduleContext';
import { Group } from '../../scene/group';
import { Rect } from '../../scene/shape/rect';
import type { LayoutCompleteEvent } from '../layout/layoutService';
export declare class Background<TImage = never> extends BaseModuleInstance implements ModuleInstance {
    protected readonly node: Group;
    protected readonly rectNode: Rect;
    visible: boolean;
    fill?: string;
    image?: TImage;
    constructor(ctx: ModuleContext);
    protected onLayoutComplete(e: LayoutCompleteEvent): void;
}
