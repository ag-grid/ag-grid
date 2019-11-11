import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { FontStyle, FontWeight } from "./scene/shape/text";
export declare class Caption {
    onChange?: () => void;
    readonly node: Text;
    constructor();
    text: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string;
    private _enabled;
    enabled: boolean;
    private _padding;
    padding: Padding;
    private update;
}
