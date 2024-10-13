/* eslint-disable @typescript-eslint/no-var-requires */
const { WritableStream, TransformStream } = require('web-streams-polyfill');
const { makeCompressionStream } = require('compression-streams-polyfill/ponyfill');
const { Blob } = require('blob-polyfill');
const { TextEncoder } = require('text-encoding-polyfill');

window.Blob = Blob;
window.WritableStream = WritableStream;
window.ReadableStream = ReadableStream;
window.CompressionStream = makeCompressionStream(TransformStream);
window.TextEncoder = TextEncoder;
