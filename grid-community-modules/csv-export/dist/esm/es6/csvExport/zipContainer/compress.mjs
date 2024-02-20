var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const compressBlob = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Callback to extract the compressed data
    let chunksSize = 0;
    const chunks = [];
    const writeCompressedData = new WritableStream({
        write: (chunk) => {
            chunks.push(chunk);
            chunksSize += chunk.length;
        }
    });
    // Create readable stream from blob
    const readable = new ReadableStream({
        start: (controller) => {
            const reader = new FileReader();
            reader.onload = e => {
                var _a;
                if ((_a = e.target) === null || _a === void 0 ? void 0 : _a.result) {
                    controller.enqueue(e.target.result);
                }
                controller.close();
            };
            reader.readAsArrayBuffer(data);
        }
    });
    // Perform the compression using the browser's native CompressionStream API
    // Ref https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream for details
    const compressStream = new window.CompressionStream('deflate-raw');
    yield readable.pipeThrough(compressStream).pipeTo(writeCompressedData);
    // Return the compressed data
    return {
        size: chunksSize,
        content: new Blob(chunks),
    };
});
export const deflateLocalFile = (rawContent) => __awaiter(void 0, void 0, void 0, function* () {
    const contentAsBlob = new Blob([rawContent]);
    const { size: compressedSize, content: compressedContent } = yield compressBlob(contentAsBlob);
    const compressedContentAsUint8Array = new Uint8Array(yield compressedContent.arrayBuffer());
    return {
        size: compressedSize,
        content: compressedContentAsUint8Array,
    };
});
