import { Rect } from '../../scene/shape/rect';
import { Group } from '../../scene/group';
import { BaseModuleInstance, ModuleContext, ModuleInstance } from '../../util/module';
import { ProxyPropertyOnWrite } from '../../util/proxy';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../../util/validation';
import { LayoutCompleteEvent } from '../layout/layoutService';

export class Background extends BaseModuleInstance implements ModuleInstance {
    private node: Group;
    private rectNode: Rect;

    constructor(ctx: ModuleContext) {
        super();

        this.node = new Group({ name: 'background' });
        this.rectNode = new Rect();
        this.node.appendChild(this.rectNode);
        this.visible = true;

        ctx.scene.root?.insertBefore(this.node, ctx.scene.root.children[0]);
        this.destroyFns.push(() => ctx.scene.root?.removeChild(this.node));

        const layoutHandle = ctx.layoutService.addListener('layout-complete', this.onLayoutComplete);
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));
    }

    update(): void {}

    @Validate(BOOLEAN)
    @ProxyPropertyOnWrite('node', 'visible')
    visible: boolean;

    @Validate(OPT_COLOR_STRING)
    @ProxyPropertyOnWrite('rectNode', 'fill')
    fill: string | undefined;

    private onLayoutComplete = (e: LayoutCompleteEvent) => {
        const { width, height } = e.chart;
        this.rectNode.width = width;
        this.rectNode.height = height;
    };
}
