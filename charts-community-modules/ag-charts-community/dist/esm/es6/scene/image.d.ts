import type { RenderContext } from './node';
import { Node } from './node';
export declare class Image extends Node {
    private readonly sourceImage;
    constructor(sourceImage: HTMLImageElement);
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    render(renderCtx: RenderContext): void;
}
