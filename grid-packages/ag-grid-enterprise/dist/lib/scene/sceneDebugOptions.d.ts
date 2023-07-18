export declare enum SceneDebugLevel {
    SUMMARY = 0,
    DETAILED = 1
}
export interface SceneDebugOptions {
    stats: false | 'basic' | 'detailed';
    dirtyTree: boolean;
    renderBoundingBoxes: boolean;
    consoleLog: boolean;
    level: SceneDebugLevel;
    sceneNodeHighlight: (string | RegExp)[];
}
//# sourceMappingURL=sceneDebugOptions.d.ts.map