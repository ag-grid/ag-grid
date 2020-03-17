import { FontStyle, FontWeight } from "../scene/shape/text";
import { Observable } from "../util/observable";
export declare class Label extends Observable {
    enabled: boolean;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    color: string;
    constructor();
}
