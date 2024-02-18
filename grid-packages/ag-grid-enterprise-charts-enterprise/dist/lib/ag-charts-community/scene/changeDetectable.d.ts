export declare enum RedrawType {
    NONE = 0,
    TRIVIAL = 1,
    MINOR = 2,
    MAJOR = 3
}
type SceneChangeDetectionOptions = {
    redraw?: RedrawType;
    type?: 'normal' | 'transform' | 'path' | 'font';
    convertor?: (o: any) => any;
    changeCb?: (o: any) => any;
    checkDirtyOnAssignment?: boolean;
};
export declare function SceneChangeDetection(opts?: SceneChangeDetectionOptions): (target: any, key: string) => void;
export declare abstract class ChangeDetectable {
    protected _dirty: RedrawType;
    protected markDirty(_source: any, type?: RedrawType): void;
    markClean(_opts?: {
        force?: boolean;
        recursive?: boolean;
    }): void;
    isDirty(): boolean;
}
export {};
