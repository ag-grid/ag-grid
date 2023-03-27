import { _ModuleSupport, _Util, _Scene } from 'ag-charts-community';
import { BackgroundImage } from './backgroundImage';

const { ActionOnSet, Validate, ProxyPropertyOnWrite, BOOLEAN, OPT_COLOR_STRING } = _ModuleSupport;
const { Group, Rect } = _Scene;

export class Background extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    private readonly node: _Scene.Group;
    private readonly rectNode: _Scene.Rect;
    private readonly scene: _Scene.Scene;
    private readonly updateService: _ModuleSupport.UpdateService;

    @Validate(BOOLEAN)
    @ProxyPropertyOnWrite('node', 'visible')
    visible: boolean;

    @Validate(OPT_COLOR_STRING)
    @ProxyPropertyOnWrite('rectNode', 'fill')
    fill: string | undefined;

    @ActionOnSet<Background>({
        newValue(image: BackgroundImage) {
            this.node.appendChild(image.node);
            image.onload = this.onImageLoad;
        },
        oldValue(image: BackgroundImage) {
            this.node.removeChild(image.node);
            image.onload = undefined;
        },
    })
    image: BackgroundImage | undefined = undefined;

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        this.scene = ctx.scene;
        this.updateService = ctx.updateService;

        this.node = this.scene.root!.children.find((node) => node instanceof Group && node.name === 'background') as _Scene.Group;
        this.rectNode = this.node.children.find((node) => node instanceof Rect) as _Scene.Rect;
        this.visible = true;

        const layoutHandle = ctx.layoutService.addListener('layout-complete', () => this.onLayoutComplete());
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));
    }

    update(): void {
    }
    
    performLayout(width: number, height: number) {
        this.rectNode.width = width;
        this.rectNode.height = height;
        if (this.image) {
            this.image.performLayout(width, height);
        }
    }

    private onLayoutComplete() {
        const { width, height } = this.scene;
        this.performLayout(width, height);
    }

    private onImageLoad() {
        this.updateService.update(_ModuleSupport.ChartUpdateType.SCENE_RENDER);
    }
}
