/* eslint-disable @typescript-eslint/no-var-requires */
const { WritableStream, TransformStream } = require('web-streams-polyfill');
const { makeCompressionStream } = require('compression-streams-polyfill/ponyfill');
const { Blob } = require('blob-polyfill');
const { TextEncoder } = require('text-encoding-polyfill');

globalThis.Blob = Blob;
globalThis.WritableStream = WritableStream;
globalThis.ReadableStream = ReadableStream;
globalThis.CompressionStream = makeCompressionStream(TransformStream);
globalThis.TextEncoder = TextEncoder;
