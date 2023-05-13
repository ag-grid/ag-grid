import { Text } from './scene/shape/text';
import { FontStyle, FontWeight } from './chart/agChartOptions';
export declare class Caption {
    static readonly PADDING = 10;
    readonly node: Text;
    enabled: boolean;
    text: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string | undefined;
    spacing?: number;
    private _lineHeight;
    get lineHeight(): number | undefined;
    set lineHeight(value: number | undefined);
    constructor();
}
