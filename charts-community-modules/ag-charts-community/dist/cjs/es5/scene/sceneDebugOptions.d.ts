export interface SceneDebugOptions {
    stats: false | 'basic' | 'detailed';
    dirtyTree: boolean;
    renderBoundingBoxes: boolean;
    consoleLog: boolean;
    sceneNodeHighlight: (string | RegExp)[];
}
