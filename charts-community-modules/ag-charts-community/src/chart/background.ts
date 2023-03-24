import { Rect } from '../scene/shape/rect';
import { Group } from '../scene/group';
import { ProxyPropertyOnWrite } from '../util/proxy';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../util/validation';

export class Background {
    readonly node: Group;
    readonly rectNode: Rect;

    constructor() {
        this.node = new Group({ name: 'background' });
        this.rectNode = new Rect();
        this.node.appendChild(this.rectNode);
        this.visible = true;
    }

    @Validate(BOOLEAN)
    @ProxyPropertyOnWrite('node', 'visible')
    visible: boolean;

    @Validate(OPT_COLOR_STRING)
    @ProxyPropertyOnWrite('rectNode', 'fill')
    fill: string | undefined;

    performLayout(width: number, height: number) {
        this.rectNode.width = width;
        this.rectNode.height = height;
    }
}
