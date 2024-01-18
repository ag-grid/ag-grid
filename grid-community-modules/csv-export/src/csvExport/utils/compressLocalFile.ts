import { compressBlob } from "./compress";
import { getDecodedContent } from "./getDecodedContent";

export const compressLocalFile = async (content: string, isBase64: boolean): Promise<{
    size: number;
    content: Uint8Array;
}> => {
    const {
        content: decodedContent,
    } = getDecodedContent(content, isBase64);

    const contentAsBlob = new Blob([decodedContent]);

    const {
        size: compressedSize,
        content: compressedContent
    } = await compressBlob(contentAsBlob);

    const compressedContentAsUint8Array = new Uint8Array(await compressedContent.arrayBuffer());

    return {
        size: compressedSize,
        content: compressedContentAsUint8Array,
    };
};
