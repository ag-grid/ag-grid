import { Blob } from 'blob-polyfill';
import { Canvas } from 'canvas';
import { makeCompressionStream } from 'compression-streams-polyfill/ponyfill';
import { TextEncoder } from 'text-encoding-polyfill';
import { ReadableStream, TransformStream, WritableStream } from 'web-streams-polyfill';

globalThis.Blob = Blob;
globalThis.WritableStream = WritableStream;
globalThis.ReadableStream = ReadableStream;
globalThis.CompressionStream = makeCompressionStream(TransformStream as typeof globalThis.TransformStream);
globalThis.TextEncoder = TextEncoder;
globalThis.OffscreenCanvas = Canvas as any;
