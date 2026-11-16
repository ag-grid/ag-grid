const COMPRESSION_CHUNK_SIZE = 65536;

export const deflateLocalFile = async (
    rawContent: string | Uint8Array<ArrayBuffer>
): Promise<{ size: number; content: Uint8Array<ArrayBuffer> }> => {
    const bytes = typeof rawContent === 'string' ? new TextEncoder().encode(rawContent) : rawContent;
    let offset = 0;
    let chunksSize = 0;
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    const writeCompressedData: WritableStream<Uint8Array<ArrayBuffer>> = new WritableStream({
        write: (chunk: Uint8Array<ArrayBuffer>) => {
            chunks.push(chunk);
            chunksSize += chunk.length;
        },
    });

    const readable = new ReadableStream<Uint8Array<ArrayBuffer>>({
        pull: (controller) => {
            if (offset === bytes.length) {
                controller.close();
                return;
            }
            const end = Math.min(offset + COMPRESSION_CHUNK_SIZE, bytes.length);
            // Compressors may transfer chunks; the source bytes are still needed for the ZIP checksum.
            controller.enqueue(bytes.slice(offset, end));
            offset = end;
        },
    });

    const compressStream = new CompressionStream('deflate-raw');
    await readable.pipeThrough(compressStream).pipeTo(writeCompressedData);

    const content = new Uint8Array(chunksSize);
    let written = 0;
    for (let i = 0, len = chunks.length; i < len; ++i) {
        const chunk = chunks[i];
        content.set(chunk, written);
        written += chunk.length;
    }
    return { size: chunksSize, content };
};
