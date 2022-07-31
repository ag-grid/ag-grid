import { FontStyle, FontWeight } from '../scene/shape/text';
export declare class Label {
    enabled: boolean;
    fontSize: number;
    fontFamily: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    color: string;
    getFont(): string;
}
