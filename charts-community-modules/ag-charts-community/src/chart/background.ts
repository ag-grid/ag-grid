import { Rect } from '../scene/shape/rect';
import { Group } from '../scene/group';
import { ActionOnSet, ProxyPropertyOnWrite } from '../util/proxy';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../util/validation';
import { BackgroundImage } from './backgroundImage';

export class Background {
    readonly node: Group;
    readonly rectNode: Rect;
    private readonly imageLoadCallback: () => void;

    constructor(imageLoadCallback: () => void) {
        this.node = new Group();
        this.rectNode = new Rect();
        this.node.appendChild(this.rectNode);
        this.visible = true;
        this.imageLoadCallback = imageLoadCallback;
    }

    @Validate(BOOLEAN)
    @ProxyPropertyOnWrite('node', 'visible')
    visible: boolean;

    @Validate(OPT_COLOR_STRING)
    @ProxyPropertyOnWrite('rectNode', 'fill')
    fill: string | undefined;

    @ActionOnSet<Background>({
        newValue(image: BackgroundImage) {
            this.node.appendChild(image.node);
            image.onload = this.imageLoadCallback;
        },
        oldValue(image: BackgroundImage) {
            this.node.removeChild(image.node);
            image.onload = undefined;
        },
    })
    image: BackgroundImage | undefined = undefined;

    performLayout(width: number, height: number) {
        this.rectNode.width = width;
        this.rectNode.height = height;
        if (this.image) {
            this.image.performLayout(width, height);
        }
    }
}
