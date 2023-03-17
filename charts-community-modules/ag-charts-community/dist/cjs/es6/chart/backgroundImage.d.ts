import { Image } from '../scene/image';
export declare class BackgroundImage {
    readonly node: Image;
    private readonly _image;
    private loadedSynchronously;
    constructor();
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
    width?: number;
    height?: number;
    opacity: number;
    get url(): string;
    set url(value: string);
    get complete(): boolean;
    private containerWidth;
    private containerHeight;
    onload?: () => void;
    performLayout(containerWidth: number, containerHeight: number): void;
    calculatePosition(naturalWidth: number, naturalHeight: number): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private onImageLoad;
}
