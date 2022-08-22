import { Text, FontStyle, FontWeight } from './scene/shape/text';
import { Observable } from './util/observable';
export declare class Caption extends Observable {
    static readonly PADDING = 10;
    readonly node: Text;
    enabled: boolean;
    set text(value: string);
    get text(): string;
    set fontStyle(value: FontStyle | undefined);
    get fontStyle(): FontStyle | undefined;
    set fontWeight(value: FontWeight | undefined);
    get fontWeight(): FontWeight | undefined;
    set fontSize(value: number);
    get fontSize(): number;
    set fontFamily(value: string);
    get fontFamily(): string;
    set color(value: string | undefined);
    get color(): string | undefined;
    constructor();
}
