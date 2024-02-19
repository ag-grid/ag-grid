import { extensionMimeType, fileNameToMimeType } from './mimeType';

describe.each([
    { fileName: 'styles.css', output: 'text/css' },
    { fileName: 'script.js', output: 'text/javascript' },
    { fileName: 'text.txt', output: 'text/plain' },
    { fileName: 'content.json', output: 'application/json' },
    { fileName: 'index.htm', output: 'text/html' },
    { fileName: 'index.html', output: 'text/html' },
    { fileName: 'image.png', output: 'image/png' },
    { fileName: 'image.webp', output: 'image/webp' },
    { fileName: 'image.jpeg', output: 'image/jpeg' },
    { fileName: 'image.jpg', output: 'image/jpeg' },
    { fileName: 'multi.word.script.js', output: 'text/javascript' },
    { fileName: 'something.someWeirdFileExt', output: 'text/plain' },
    { fileName: 'something', output: 'text/plain' },
])('fileNameToMimeType', ({ fileName, output }) => {
    it(`${fileName} outputs ${output}`, () => {
        expect(fileNameToMimeType(fileName)).toEqual(output);
    });
});

describe.each([
    { extension: undefined, output: 'text/plain' },
    { extension: 'css', output: 'text/css' },
    { extension: 'js', output: 'text/javascript' },
    { extension: 'txt', output: 'text/plain' },
    { extension: 'json', output: 'application/json' },
    { extension: 'htm', output: 'text/html' },
    { extension: 'html', output: 'text/html' },
    { extension: 'png', output: 'image/png' },
    { extension: 'webp', output: 'image/webp' },
    { extension: 'jpeg', output: 'image/jpeg' },
    { extension: 'jpg', output: 'image/jpeg' },
])('extensionMimeType', ({ extension, output }) => {
    it(`${extension} outputs ${output}`, () => {
        expect(extensionMimeType(extension)).toEqual(output);
    });
});
