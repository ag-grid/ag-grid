import zlib from 'zlib';

let allBlobs: BlobWithUrl[] = [];
let urlCounter = 0;
let initialized = false;

export interface BlobWithUrl extends Blob {
    _url: string;
    _idx: number;
}

/**
 * Intercepts the creation and revocation of object URLs so a test can pull back what the grid exported.
 * Also replaces `CompressionStream`, which happy-dom does not implement.
 */
export const objectUrls = {
    init() {
        if (!initialized) {
            initialized = true;
            initialize();
        }
        this.reset();
    },

    reset() {
        urlCounter = 0;
        allBlobs = [];
    },

    all(): BlobWithUrl[] {
        return allBlobs.slice();
    },

    pullBlobs(): Promise<BlobWithUrl[]> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (allBlobs.length) {
                    clearInterval(interval);
                    resolve(allBlobs.slice());
                    allBlobs = [];
                }
            }, 1);
        });
    },

    async pullBlob(): Promise<BlobWithUrl> {
        const blobs = await this.pullBlobs();
        return blobs[blobs.length - 1];
    },
};

function initialize(): void {
    // Unconditional, not a fallback: node's own CompressionStream is present in both environments and
    // the excel export hangs on it (measured — six export suites time out), so the zlib shim wins.
    global.CompressionStream = CompressionStreamPolyfill;

    const oldCreateObjectURL = window.URL.createObjectURL;
    const oldRevokeObjectURL = window.URL.revokeObjectURL;

    window.URL.createObjectURL = function createObjectURL(blob: Blob) {
        const objectUrl = oldCreateObjectURL?.call(window.URL, blob) ?? `#$blob-${urlCounter++}`;
        allBlobs.push(Object.assign(blob, { _url: objectUrl, _idx: allBlobs.length }));
        return objectUrl;
    };

    window.URL.revokeObjectURL = function revokeObjectURL(url: string) {
        oldRevokeObjectURL?.call(window.URL, url);
    };
}

const COMPRESSORS: Record<string, (() => zlib.Gzip | zlib.Deflate | zlib.DeflateRaw) | undefined> = {
    gzip: () => zlib.createGzip(),
    deflate: () => zlib.createDeflate(),
    'deflate-raw': () => zlib.createDeflateRaw(),
};

class CompressionStreamPolyfill implements TransformStream {
    public writable: WritableStream<any>;
    public readable: ReadableStream<any>;

    constructor(format: 'gzip' | 'deflate' | 'deflate-raw') {
        const createStream = COMPRESSORS[format];
        if (!createStream) {
            throw new TypeError('Invalid format.');
        }
        const nodeStream = createStream();
        this.readable = new ReadableStream({
            start: (controller) => {
                nodeStream.on('data', (chunk) => controller.enqueue(chunk));
                nodeStream.on('end', () => controller.close());
                nodeStream.on('error', (err) => controller.error(err));
            },
            cancel: (reason) => {
                nodeStream.destroy(reason);
            },
        });

        this.writable = new WritableStream({
            write: (chunk) => {
                return new Promise((resolve, reject) => {
                    chunk = Buffer.from(chunk);
                    if (
                        nodeStream.write(chunk, (err) => {
                            if (err) {
                                reject(err);
                            }
                        })
                    ) {
                        resolve();
                    } else {
                        nodeStream.once('drain', () => resolve());
                    }
                });
            },
            close: () => {
                return new Promise((resolve, reject) => {
                    nodeStream.end();
                    nodeStream.once('finish', () => resolve());
                    nodeStream.once('error', (err) => reject(err));
                });
            },
            abort: (reason) => {
                nodeStream.destroy(reason);
            },
        });
    }
}
