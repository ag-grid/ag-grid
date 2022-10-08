import type ts from 'typescript';

export interface Transpiler {
    onChange: (callback: () => void) => void;
    stop: () => void;
}
export interface TranspilerOptions {
    entries: string[];
    compilerOptions: ts.CompilerOptions;
    debounce: number;
    emit: (file: string, content: string) => void;
}
