import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { PointerEvents } from "./scene/node";
import { FontStyle, FontWeight } from "./scene/shape/text";
import { Observable, reactive } from "./util/observable";

export class Caption extends Observable {
    readonly node: Text = new Text();

    @reactive(['style']) enabled = true;
    @reactive(['style']) padding = new Padding(10);

    @reactive(['style'], 'node.text') text: string;
    @reactive(['style'], 'node.fontStyle') fontStyle: FontStyle | undefined;
    @reactive(['style'], 'node.fontWeight') fontWeight: FontWeight | undefined;
    @reactive(['style'], 'node.fontSize') fontSize: number;
    @reactive(['style'], 'node.fontFamily') fontFamily: string;
    @reactive(['style'], 'node.fill') color: string;

    constructor() {
        super();

        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }
}
