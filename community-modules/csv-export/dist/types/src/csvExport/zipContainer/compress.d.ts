export declare const deflateLocalFile: (rawContent: string | Uint8Array) => Promise<{
    size: number;
    content: Uint8Array;
}>;
