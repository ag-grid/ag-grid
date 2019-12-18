import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { PointerEvents } from "./scene/node";
import { FontStyle, FontWeight } from "./scene/shape/text";
import { Observable, reactive } from "./util/observable";

export class Caption extends Observable {
    readonly node: Text = new Text();

    static defaults = {
        enabled: true,
        padding: new Padding(10)
    };

    @reactive(['change']) enabled = Caption.defaults.enabled;
    @reactive(['change']) padding = Caption.defaults.padding;

    @reactive(['change'], 'node.text') text: string;
    @reactive(['change'], 'node.fontStyle') fontStyle: FontStyle | undefined;
    @reactive(['change'], 'node.fontWeight') fontWeight: FontWeight | undefined;
    @reactive(['change'], 'node.fontSize') fontSize: number;
    @reactive(['change'], 'node.fontFamily') fontFamily: string;
    @reactive(['change'], 'node.fill') color: string;

    constructor() {
        super();

        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
    }
}
