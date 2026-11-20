// `ALL_SEVERITIES` comes from the specific module, not the test-utils barrel: the barrel transitively
// imports `ag-grid-community` at runtime, which would defeat the lazy `ag`-import guard below.
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';
import { runFileEndCallbacks } from 'ag-test-utils/fileScope';
import { ignoreConsoleLicenseKeyError } from 'ag-test-utils/ignoreKnownNoise';
import { polyfillDomGlobals } from 'ag-test-utils/polyfills/domGlobals';
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi, vitest } from 'vitest';

import { clearFileIntervals } from './fileIntervals';

// Runs once per test file: the project keeps one window and module graph per worker (`isolate: false`), so
// this file installs what every file needs once, and puts the page back the way it found it at each file's end.

polyfillDomGlobals();

// Imported after the DOM globals they read are in place.
const [{ mockGridLayout }, { objectUrls }, { clipboardUtils }] = await Promise.all([
    import('ag-test-utils/polyfills/mockGridLayout'),
    import('ag-test-utils/polyfills/objectUrls'),
    import('ag-test-utils/polyfills/clipboard'),
]);
mockGridLayout.init();
objectUrls.init();
clipboardUtils.init();
// user-event patches `focus`/`blur` once per window and marks the document, so it can never be undone per file.
(await import('@testing-library/user-event')).default.setup();

// user-event resets its clipboard stub after each test and detaches it after the file through hooks it registers on
// import, which a shared module graph runs for the first file only: run them for every file.
const userEventClipboard = await import('@testing-library/user-event/dist/esm/utils/dataTransfer/Clipboard.js');
userEventClipboard.detachClipboardStubFromView(window);
afterEach(() => userEventClipboard.resetClipboardStubOnView(window));

// React Testing Library sets its cleanup, act environment and `@testing-library/dom` wrappers on import, which a
// shared module graph runs once: set per file instead (a `.tsx` test file is a React one).
const testingLibraryScope = await import('./testingLibraryScope');
process.env.RTL_SKIP_AUTO_CLEANUP = 'true';
let reactCleanup: (() => void) | undefined;
beforeAll(async () => {
    const reactFile = expect.getState().testPath?.endsWith('.tsx') === true;
    reactCleanup = await testingLibraryScope.useTestingLibraryFor(reactFile);
});
afterEach(() => reactCleanup?.());

// A misconfigured grid under test fails loudly rather than scrolling past in the console. Re-asserted each
// test because the throw config is global, last-write-wins module state; a test exercising a diagnostic
// opts out with its own `enableDevValidations({ suppress: [id] })`. Imported lazily so this file does not
// pull the grid in before a test's own pre-`ag`-import ordering guards have run.
beforeEach(async () => {
    const { _resetOncePerPageLogging, enableDevValidations } = await import('ag-grid-community');
    _resetOncePerPageLogging();
    enableDevValidations({ throwOn: ALL_SEVERITIES });
    ignoreConsoleLicenseKeyError();
});

// Shim for code that references `jest` — redirect to vitest.
(globalThis as Record<string, unknown>).jest = vitest;
// Before the snapshot, so the filter belongs to the page every file starts from; the `beforeEach` call re-wraps it
// only when a test's spy displaced it.
ignoreConsoleLicenseKeyError();

const baseline = snapshotSharedObjects();
const bodyAttributes = snapshotAttributes(document.body);
const htmlAttributes = snapshotAttributes(document.documentElement);
const headChildren = Array.from(document.head.childNodes);

// Registered before the file's own hooks, so it runs after all of them.
afterAll(async () => {
    const [{ _resetModuleRegistry, _resetValidationLogging, getGridApi }, { _doOnce, _resetKeyboardMode }] =
        await Promise.all([import('ag-grid-community'), import('ag-stack')]);
    // Each step runs even when an earlier one throws: a half-reset page fails the next file instead of this one.
    let leaks: string[] = [];
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
            clearFileIntervals();
            vi.unstubAllGlobals();
            vi.unstubAllEnvs();

            (document.activeElement as HTMLElement | null)?.blur?.();
            document.body.replaceChildren();
            restoreAttributes(document.body, bodyAttributes);
            restoreAttributes(document.documentElement, htmlAttributes);
            // A new head, not an emptied one: AG Charts injects its CSS once per head element.
            const head = document.createElement('head');
            head.append(...headChildren);
            document.documentElement.replaceChild(head, document.head);

            mockGridLayout.resetOptions();
            objectUrls.reset();
            userEventClipboard.detachClipboardStubFromView(window);
            clipboardUtils.reset();
            testingLibraryScope.endTestingLibraryFile();

            _resetModuleRegistry();
            _resetValidationLogging();
            _resetKeyboardMode();
            _doOnce._set.clear();
            leaks = restoreSharedObjects(baseline);
        }
    }

    if (leaks.length) {
        throw new Error(
            `This test file left shared globals or prototypes changed (put back, so the next file in the worker starts clean):\n` +
                `  ${leaks.join('\n  ')}\n` +
                `Patch through \`definePropertyForFile\` (ag-test-utils/fileScope), or restore in afterAll.`
        );
    }
});

// Snapshot update mode reaches a TypeScript AST rewriter, so the runs that do not ask for it never load one.
if (process.env.UPDATE_GRID_ROWS_SNAPSHOTS) {
    await import('./vitest.setup.snapshots');
}

type SharedObjectSnapshot = Map<
    object,
    { name: string; descriptors: Record<PropertyKey, PropertyDescriptor>; stringKeysOnly: boolean }
>;

/** Set by a library's first use in a worker and kept: the xlsx library's global, the grid's style registry, and
 *  React's mark on the document it listens to. */
const LOAD_ONCE_GLOBAL = /^(XLSX|agStyleInjectionVersions|_reactListening\w+)$/;

/** Own properties of the page's globals and of every constructor on `window` and its prototype: where a polyfill or a
 *  test patches. String keys only on all but the prototypes: the environment and user-event cache by symbol there. */
function snapshotSharedObjects(): SharedObjectSnapshot {
    const snapshot: SharedObjectSnapshot = new Map();
    const add = (target: object, name: string, stringKeysOnly: boolean) => {
        if (!snapshot.has(target)) {
            snapshot.set(target, { name, descriptors: Object.getOwnPropertyDescriptors(target), stringKeysOnly });
        }
    };
    add(globalThis, 'globalThis', true);
    add(document, 'document', true);
    add(navigator, 'navigator', true);
    add(console, 'console', true);
    for (const name of Object.getOwnPropertyNames(globalThis)) {
        // Read through the property, not its descriptor: the environment exposes the DOM classes as getters.
        let value: unknown;
        try {
            value = Reflect.get(globalThis, name);
        } catch {
            continue;
        }
        if (typeof value !== 'function') {
            continue;
        }
        // Not vitest's `expect`, whose statics are the matchers `expect.extend` adds as each library first loads.
        if (value !== expect) {
            add(value, name, true);
        }
        const prototype: unknown = value.prototype;
        if (prototype && typeof prototype === 'object') {
            add(prototype, `${name}.prototype`, false);
        }
    }
    return snapshot;
}

/** Puts every object back to its snapshot, returning what had changed: a leak fails only the file leaving it. */
function restoreSharedObjects(before: SharedObjectSnapshot): string[] {
    const changes: string[] = [];
    for (const [target, { name, descriptors, stringKeysOnly }] of before) {
        const now = Object.getOwnPropertyDescriptors(target);
        const ownKeys = stringKeysOnly ? Object.getOwnPropertyNames : Reflect.ownKeys;
        for (const key of ownKeys(now)) {
            const was = descriptors[key as keyof typeof descriptors];
            if (!was) {
                if (typeof key === 'string' && LOAD_ONCE_GLOBAL.test(key)) {
                    continue;
                }
                const restored = Reflect.deleteProperty(target, key);
                changes.push(`${name}.${String(key)} added${restored ? '' : ' (not configurable: left)'}`);
            } else if (!sameDescriptor(was, now[key as keyof typeof now])) {
                const restored = Reflect.defineProperty(target, key, was);
                changes.push(`${name}.${String(key)} replaced${restored ? '' : ' (not configurable: left)'}`);
            }
        }
        for (const key of ownKeys(descriptors)) {
            if (!(key in now)) {
                Reflect.defineProperty(target, key, descriptors[key as keyof typeof descriptors]);
                changes.push(`${name}.${String(key)} removed`);
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
