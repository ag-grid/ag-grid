export const compressBlob = async (data: Blob): Promise<{
    size: number;
    content: Blob;
}> => {
    // Callback to extract the compressed data
    let chunksSize = 0;
    const chunks: Uint8Array[] = [];
    const writeCompressedData: WritableStream<Uint8Array> = new WritableStream({
        write: (chunk: Uint8Array) => {
            chunks.push(chunk);
            chunksSize += chunk.length;
        }
    });

    // Create readable stream from blob
    const readable = new ReadableStream({
        start: (controller) => {
            const reader = new FileReader();
            reader.onload = e => {
                if (e.target?.result) {
                    controller.enqueue(e.target.result);
                }

                controller.close();
            }

            reader.readAsArrayBuffer(data);
        }
    });

    // Perform the compression using the browser's native CompressionStream API
    // Ref https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream for details
    const compressStream = new (window as any).CompressionStream('deflate-raw');
    await readable.pipeThrough(compressStream).pipeTo(writeCompressedData);

    // Return the compressed data
    return {
        size: chunksSize,
        content: new Blob(chunks),
    }
};
