import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import { afterAll, expect, vitest } from 'vitest';

// Register all jest-dom matchers globally.
expect.extend(jestDomMatchers);

// Shim for code that references `jest` — redirect to vitest.
(globalThis as Record<string, unknown>).jest = vitest;

// Polyfill jsdom gaps: Blob.arrayBuffer() and CompressionStream (needed by excel export).
if (globalThis.Blob && !globalThis.Blob.prototype.arrayBuffer) {
    globalThis.Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(this);
        });
    };
}
if (typeof (globalThis as any).CompressionStream === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { WritableStream, TransformStream } = require('web-streams-polyfill');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeCompressionStream } = require('compression-streams-polyfill/ponyfill');
    (globalThis as any).WritableStream = WritableStream;
    (globalThis as any).CompressionStream = makeCompressionStream(TransformStream);
}

// Fix jsdom: clicking <a download> shouldn't trigger navigation — in real browsers
// the download attribute makes the click save the file instead of navigating.
// jsdom doesn't implement this and throws "Not implemented: navigation".
{
    const origDispatchEvent = HTMLAnchorElement.prototype.dispatchEvent;
    HTMLAnchorElement.prototype.dispatchEvent = function (event: Event) {
        if (event.type === 'click' && this.hasAttribute('download')) {
            return true;
        }
        return origDispatchEvent.call(this, event);
    };
}

// Ensure stack traces are long enough to be useful.
if (Error.stackTraceLimit < 40) {
    Error.stackTraceLimit = 40;
}

// --- GridRows snapshot update mode -------------------------------------------
//
// When UPDATE_GRID_ROWS_SNAPSHOTS is set, GridRows.check() records mismatches
// instead of failing. After each test suite, the recorded mismatches are used
// to rewrite the source files via TypeScript AST-based replacement.
//
// Usage:
//   UPDATE_GRID_ROWS_SNAPSHOTS=1 ./behave.sh        # update all
//   UPDATE_GRID_ROWS_SNAPSHOTS=dry ./behave.sh       # dry-run, show what would change
//   ./behave.sh --update-grid-rows                    # convenience alias

{
    const envVal = process.env.UPDATE_GRID_ROWS_SNAPSHOTS;
    if (envVal) {
        const mode = envVal === 'dry' ? 'dry' : 'update';
        (globalThis as any).__gridRowsSnapshotUpdateMode = mode;
        (globalThis as any).__gridRowsSnapshotUpdates = [];

        afterAll(async () => {
            const { processSnapshotUpdates } = await import('./src/test-utils/gridRows/snapshot-updater');
            await processSnapshotUpdates(expect.getState().testPath ?? undefined);
        });
    }
}
