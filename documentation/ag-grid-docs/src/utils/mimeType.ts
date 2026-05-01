const MIME_MAPPING = {
    txt: 'text/plain',
    css: 'text/css',
    js: 'text/javascript',
    json: 'application/json',
    htm: 'text/html',
    html: 'text/html',
    png: 'image/png',
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
};

const DEFAULT_MAPPING = MIME_MAPPING.txt;

type FileExt = keyof typeof MIME_MAPPING;

export function fileNameToMimeType(fileName: string): string {
    const fileNameParts = fileName.split('.');
    const extension = fileNameParts.slice(-1)[0];
    return extensionMimeType(extension);
}

export function extensionMimeType(extension?: string): string {
    return MIME_MAPPING[extension as FileExt] ?? DEFAULT_MAPPING;
}
