const { WritableStream, TransformStream } = require('web-streams-polyfill');
const { makeCompressionStream} = require('compression-streams-polyfill/ponyfill');
const { Blob } = require('blob-polyfill');

window.Blob = Blob;
window.WritableStream = WritableStream;
window.ReadableStream = ReadableStream;
window.CompressionStream = makeCompressionStream(TransformStream);
