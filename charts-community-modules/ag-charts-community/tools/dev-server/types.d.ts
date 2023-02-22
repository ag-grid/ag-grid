import type { Server } from 'http';
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

export interface DevServer {
    httpServer: Server;
    addStaticFile(path: string, content: string | Buffer): void;
    start(): Promise<void>;
    close(): Promise<void>;
}

export interface LiveReloadServer {
    sendMessage(message: any): void;
}
