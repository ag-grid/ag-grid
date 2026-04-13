// jsdom's streams lack CompressionStream. Node's native CompressionStream deadlocks
// with jsdom's FileReader, so we use pure-JS polyfills instead.
import { makeCompressionStream } from 'compression-streams-polyfill/ponyfill';
import { ReadableStream, TransformStream, WritableStream } from 'web-streams-polyfill';

// Polyfill browser APIs missing from jsdom environment.

// jsdom's Blob lacks .arrayBuffer() — add it via FileReader.
if (globalThis.Blob && !globalThis.Blob.prototype.arrayBuffer) {
    globalThis.Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(this);
        });
    };
}

// All stream classes must come from the same implementation to avoid
// "must be an instance of ReadableStream" errors during pipeThrough.
(globalThis as any).ReadableStream = ReadableStream;
(globalThis as any).WritableStream = WritableStream;
(globalThis as any).CompressionStream = makeCompressionStream(TransformStream as any);

export {};
