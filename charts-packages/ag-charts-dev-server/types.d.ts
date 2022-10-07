export interface Transpiler {
    onChange: (callback: () => void) => void;
    stop: () => void;
}
export interface TranspilerOptions {
    entry: string;
    srcDir: string;
    destDir: string;
    debounce: number;
    emit: (file: string, content: string) => void;
}
