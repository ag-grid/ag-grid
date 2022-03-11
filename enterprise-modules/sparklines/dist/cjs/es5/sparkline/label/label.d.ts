import { FontStyle, FontWeight } from '../../scene/shape/text';
import { Observable } from '../../util/observable';
export declare class Label extends Observable {
    enabled: boolean;
    fontSize: number;
    fontFamily: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    color: string;
    getFont(): string;
    constructor();
}
