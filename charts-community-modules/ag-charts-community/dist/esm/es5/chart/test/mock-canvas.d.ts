import { Canvas } from 'canvas';
export declare class MockContext {
    realCreateElement: typeof document.createElement;
    ctx: {
        nodeCanvas: Canvas;
    };
    canvasStack: Canvas[];
    canvases: Canvas[];
    constructor(width?: number, height?: number, realCreateElement?: typeof document.createElement);
    destroy(): void;
}
export declare function setup({ width, height, mockCtx }?: {
    width?: number | undefined;
    height?: number | undefined;
    mockCtx?: MockContext | undefined;
}): MockContext;
export declare function teardown(mockContext: MockContext): void;
