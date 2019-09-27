// ag-grid-enterprise v21.2.2
export interface DropShadowOptions {
    enabled?: boolean;
    color?: string;
    xOffset?: number;
    yOffset?: number;
    blur?: number;
}
export declare class DropShadow {
    constructor(options: DropShadowOptions);
    private _enabled;
    enabled: boolean;
    private _color;
    color: string;
    private _xOffset;
    xOffset: number;
    private _yOffset;
    yOffset: number;
    private _blur;
    blur: number;
    onChange?: () => void;
    private update;
}
