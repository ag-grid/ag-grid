// ag-grid-enterprise v21.0.1
import { Padding } from "../util/padding";
import { Text } from "../scene/shape/text";
export declare class Caption {
    static create(params?: {
        text?: string;
        font?: string;
        color?: string;
    }): Caption;
    onLayoutChange?: () => void;
    readonly node: Text;
    constructor();
    text: string;
    font: string;
    color: string;
    private _enabled;
    enabled: boolean;
    private _padding;
    padding: Padding;
    private requestLayout;
}
