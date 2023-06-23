export enum SceneDebugLevel {
    SUMMARY,
    DETAILED,
}

export interface SceneDebugOptions {
    stats: false | 'basic' | 'detailed';
    dirtyTree: boolean;
    renderBoundingBoxes: boolean;
    consoleLog: boolean;
    level: SceneDebugLevel;
    sceneNodeHighlight: (string | RegExp)[];
}
