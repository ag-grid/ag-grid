// ag-grid-enterprise v21.2.2
import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
export declare class Caption {
    static create(params?: {
        text?: string;
        fontStyle?: string;
        fontWeight?: string;
        fontSize?: number;
        fontFamily?: string;
        color?: string;
    }): Caption;
    onLayoutChange?: () => void;
    readonly node: Text;
    constructor();
    text: string;
    fontStyle: string | undefined;
    fontWeight: string | undefined;
    fontSize: number;
    fontFamily: string;
    color: string;
    private _enabled;
    enabled: boolean;
    private _padding;
    padding: Padding;
    private requestLayout;
}
