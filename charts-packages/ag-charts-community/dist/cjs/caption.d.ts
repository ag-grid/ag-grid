import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { FontStyle, FontWeight } from "./scene/shape/text";
import { Observable } from "./util/observable";
export declare class Caption extends Observable {
    readonly node: Text;
    enabled: boolean;
    padding: Padding;
    text: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string | undefined;
    constructor();
}
