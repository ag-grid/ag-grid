// `ALL_SEVERITIES` comes from the specific module, not the test-utils barrel: the barrel transitively
// imports `ag-grid-community` at runtime, which would defeat the lazy `ag`-import guard below.
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';
import { runFileEndCallbacks } from 'ag-test-utils/fileScope';
import { ignoreConsoleLicenseKeyError } from 'ag-test-utils/ignoreKnownNoise';
import { polyfillDomGlobals } from 'ag-test-utils/polyfills/domGlobals';
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi, vitest } from 'vitest';

// Runs once per test file: the project keeps one window and module graph per worker (`isolate: false`), so
// this file installs what every file needs once, and puts the page back the way it found it at each file's end.

// `process` is absent in browser mode (BENCH_BROWSER), which measures the real layout and keeps isolation.
const isNode = typeof process !== 'undefined' && process.versions?.node != null;

polyfillDomGlobals();

// Node-only, and imported here rather than statically: `objectUrls` imports `zlib`.
const nodePolyfills = isNode
    ? await Promise.all([
          import('ag-test-utils/polyfills/mockGridLayout'),
          import('ag-test-utils/polyfills/objectUrls'),
          import('ag-test-utils/polyfills/clipboard'),
      ])
    : undefined;
if (nodePolyfills) {
    const [{ mockGridLayout }, { objectUrls }, { clipboardUtils }] = nodePolyfills;
    mockGridLayout.init();
    objectUrls.init();
    clipboardUtils.init();
    // user-event patches `focus`/`blur` once per window and marks the document, so it can never be undone per file.
    (await import('@testing-library/user-event')).default.setup();
}

// React Testing Library sets its cleanup, act environment and `@testing-library/dom` wrappers on import, which a
// shared module graph runs once: set per file instead (a `.tsx` test file is a React one).
if (isNode) {
    process.env.RTL_SKIP_AUTO_CLEANUP = 'true';
    const testingLibraryScope = await import('./testingLibraryScope');
    let reactCleanup: (() => void) | undefined;
    beforeAll(async () => {
        const reactFile = expect.getState().testPath?.endsWith('.tsx') === true;
        reactCleanup = await testingLibraryScope.useTestingLibraryFor(reactFile);
    });
    afterEach(() => reactCleanup?.());
}

// A misconfigured grid under test fails loudly rather than scrolling past in the console. Re-asserted each
// test because the throw config is global, last-write-wins module state; a test exercising a diagnostic
// opts out with its own `enableDevValidations({ suppress: [id] })`. Imported lazily so this file does not
// pull the grid in before a test's own pre-`ag`-import ordering guards have run.
beforeEach(async () => {
    const { enableDevValidations } = await import('ag-grid-community');
    enableDevValidations({ throwOn: ALL_SEVERITIES });
    ignoreConsoleLicenseKeyError();
});

// Shim for code that references `jest` — redirect to vitest.
(globalThis as Record<string, unknown>).jest = vitest;

const baseline = isNode ? snapshotPrototypes() : undefined;
const bodyAttributes = isNode ? snapshotAttributes(document.body) : undefined;
const htmlAttributes = isNode ? snapshotAttributes(document.documentElement) : undefined;

// Registered before the file's own hooks, so it runs after all of them.
afterAll(async () => {
    if (!baseline || !nodePolyfills) {
        return;
    }
    const [{ _resetModuleRegistry, _resetValidationLogging, getGridApi }, { _doOnce }] = await Promise.all([
        import('ag-grid-community'),
        import('ag-stack'),
    ]);
    // Each step runs even when an earlier one throws: a half-reset page fails the next file instead of this one.
    try {
        // A grid the file left alive keeps its timers and document listeners, and would call into the next file.
        for (const root of Array.from(document.querySelectorAll('[grid-id]'))) {
            const api = getGridApi(root);
            if (api && !api.isDestroyed()) {
                api.destroy();
            }
        }
    } finally {
        try {
            runFileEndCallbacks();
        } finally {
            vi.useRealTimers();
            vi.unstubAllGlobals();
            vi.unstubAllEnvs();

            (document.activeElement as HTMLElement | null)?.blur?.();
            document.body.replaceChildren();
            restoreAttributes(document.body, bodyAttributes!);
            restoreAttributes(document.documentElement, htmlAttributes!);

            const [{ mockGridLayout }, { objectUrls }, { clipboardUtils }] = nodePolyfills;
            mockGridLayout.resetOptions();
            objectUrls.reset();
            clipboardUtils.reset();

            _resetModuleRegistry();
            _resetValidationLogging();
            _doOnce._set.clear();
        }
    }

    const leaks = restorePrototypes(baseline);
    if (leaks.length) {
        throw new Error(
            `This test file left shared prototypes changed (put back, so the next file in the worker starts clean):\n` +
                `  ${leaks.join('\n  ')}\n` +
                `Patch through \`definePropertyForFile\` (ag-test-utils/fileScope), or restore in afterAll.`
        );
    }
});

// Snapshot update mode reaches a TypeScript AST rewriter, so the runs that do not ask for it never load
// one. `process` is absent in browser mode (BENCH_BROWSER); snapshot updating is node-only anyway.
if (isNode && process.env.UPDATE_GRID_ROWS_SNAPSHOTS) {
    await import('./vitest.setup.snapshots');
}

type PrototypeSnapshot = Map<object, { name: string; descriptors: Record<PropertyKey, PropertyDescriptor> }>;

/** Own properties of every prototype of a constructor on `window`, where a polyfill or a test patches the DOM. */
function snapshotPrototypes(): PrototypeSnapshot {
    const snapshot: PrototypeSnapshot = new Map();
    for (const name of Object.getOwnPropertyNames(globalThis)) {
        // Read through the property, not its descriptor: the environment exposes the DOM classes as getters.
        let value: unknown;
        try {
            value = Reflect.get(globalThis, name);
        } catch {
            continue;
        }
        const prototype: unknown = typeof value === 'function' ? value.prototype : undefined;
        if (prototype && typeof prototype === 'object' && !snapshot.has(prototype)) {
            snapshot.set(prototype, { name, descriptors: Object.getOwnPropertyDescriptors(prototype) });
        }
    }
    return snapshot;
}

/** Puts every prototype back to its snapshot, returning what had changed: a leak fails only the file leaving it. */
function restorePrototypes(before: PrototypeSnapshot): string[] {
    const changes: string[] = [];
    for (const [prototype, { name, descriptors }] of before) {
        const now = Object.getOwnPropertyDescriptors(prototype);
        for (const key of Reflect.ownKeys(now)) {
            const was = descriptors[key as keyof typeof descriptors];
            if (!was) {
                const restored = Reflect.deleteProperty(prototype, key);
                changes.push(`${name}.prototype.${String(key)} added${restored ? '' : ' (not configurable: left)'}`);
            } else if (!sameDescriptor(was, now[key as keyof typeof now])) {
                const restored = Reflect.defineProperty(prototype, key, was);
                changes.push(`${name}.prototype.${String(key)} replaced${restored ? '' : ' (not configurable: left)'}`);
            }
        }
        for (const key of Reflect.ownKeys(descriptors)) {
            if (!(key in now)) {
                Reflect.defineProperty(prototype, key, descriptors[key as keyof typeof descriptors]);
                changes.push(`${name}.prototype.${String(key)} removed`);
            }
        }
    }
    return changes;
}

function sameDescriptor(a: PropertyDescriptor, b: PropertyDescriptor): boolean {
    return Object.is(a.value, b.value) && a.get === b.get && a.set === b.set && a.writable === b.writable;
}

function snapshotAttributes(element: Element): [string, string][] {
    return Array.from(element.attributes, (attribute): [string, string] => [attribute.name, attribute.value]);
}

function restoreAttributes(element: Element, attributes: [string, string][]): void {
    for (const name of element.getAttributeNames()) {
        element.removeAttribute(name);
    }
    for (const [name, value] of attributes) {
        element.setAttribute(name, value);
    }
}
