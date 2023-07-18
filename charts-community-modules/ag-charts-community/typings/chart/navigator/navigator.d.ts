import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
import type { ModuleInstance } from '../../util/module';
import { BaseModuleInstance } from '../../util/module';
import type { ModuleContext } from '../../util/moduleContext';
export declare class Navigator extends BaseModuleInstance implements ModuleInstance {
    private readonly ctx;
    private readonly rs;
    readonly mask: NavigatorMask;
    readonly minHandle: NavigatorHandle;
    readonly maxHandle: NavigatorHandle;
    private minHandleDragging;
    private maxHandleDragging;
    private panHandleOffset;
    private _enabled;
    set enabled(value: boolean);
    get enabled(): boolean;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    margin: number;
    set min(value: number);
    get min(): number;
    set max(value: number);
    get max(): number;
    private _visible;
    set visible(value: boolean);
    get visible(): boolean;
    private updateGroupVisibility;
    constructor(ctx: ModuleContext);
    private layout;
    private layoutComplete;
    private onDragStart;
    private onDrag;
    private onDragStop;
    private stopHandleDragging;
}
//# sourceMappingURL=navigator.d.ts.map