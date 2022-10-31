import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { Node, RenderContext } from './node';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
interface DebugOptions {
    stats: false | 'basic' | 'detailed';
    dirtyTree: boolean;
    renderBoundingBoxes: boolean;
    consoleLog: boolean;
}
interface SceneOptions {
    document: Document;
    mode: 'simple' | 'composite' | 'dom-composite' | 'adv-composite';
}
interface SceneLayer {
    id: number;
    name?: string;
    zIndex: number;
    zIndexSubOrder?: [string, number];
    canvas: HdpiOffscreenCanvas | HdpiCanvas;
}
export declare class Scene {
    static className: string;
    readonly id: string;
    readonly canvas: HdpiCanvas;
    readonly layers: SceneLayer[];
    private readonly ctx;
    private readonly opts;
    constructor(opts: {
        width?: number;
        height?: number;
        overrideDevicePixelRatio?: number;
    } & Partial<SceneOptions>);
    set container(value: HTMLElement | undefined);
    get container(): HTMLElement | undefined;
    download(fileName?: string, fileFormat?: string): void;
    getDataURL(type?: string): string;
    overrideDevicePixelRatio?: number;
    get width(): number;
    get height(): number;
    private pendingSize?;
    resize(width: number, height: number): boolean;
    private _nextZIndex;
    private _nextLayerId;
    addLayer(opts?: {
        zIndex?: number;
        zIndexSubOrder?: [string, number];
        name?: string;
    }): HdpiCanvas | HdpiOffscreenCanvas | undefined;
    removeLayer(canvas: HdpiCanvas | HdpiOffscreenCanvas): void;
    moveLayer(canvas: HdpiCanvas | HdpiOffscreenCanvas, newZIndex: number, newZIndexSubOrder?: [string, number]): void;
    private sortLayers;
    private _dirty;
    markDirty(): void;
    get dirty(): boolean;
    _root: Node | null;
    set root(node: Node | null);
    get root(): Node | null;
    readonly debug: DebugOptions;
    destroy(): void;
    render(opts?: {
        debugSplitTimes: number[];
        extraDebugStats: Record<string, number>;
    }): Promise<void>;
    debugStats(debugSplitTimes: number[], ctx: CanvasRenderingContext2D, renderCtxStats: RenderContext['stats'], extraDebugStats?: {}): void;
    buildTree(node: Node): {
        name?: string;
        node?: any;
        dirty?: string;
    };
    buildDirtyTree(node: Node): {
        dirtyTree: {
            name?: string;
            node?: any;
            dirty?: string;
        };
        paths: string[];
    };
}
export {};
