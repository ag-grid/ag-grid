import type { Canvas } from 'canvas';
export declare class MockContext {
    document: Document;
    realCreateElement: Document['createElement'];
    ctx: {
        nodeCanvas: Canvas;
    };
    canvasStack: Canvas[];
    canvases: Canvas[];
    constructor(width: number | undefined, height: number | undefined, document: Document, realCreateElement?: Document['createElement']);
    destroy(): void;
}
export declare function setup(opts: {
    width?: number;
    height?: number;
    document?: Document;
    window?: Window;
    mockCtx?: MockContext;
    mockText?: boolean;
}): MockContext;
export declare function teardown(mockContext: MockContext): void;
