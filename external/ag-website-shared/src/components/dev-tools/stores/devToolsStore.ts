import { persistentAtom } from '@nanostores/persistent';

const LOCALSTORAGE_PREFIX = 'devTools';

const parseBoolean = {
    encode: (val: any) => (val ? 'true' : 'false'),
    decode: (val: string) => val === 'true',
};

function createToggleBoolean($store: any) {
    return () => {
        const currentValue = $store.get();
        $store.set(!currentValue);
    };
}

export const $devTools = persistentAtom<boolean>(`${LOCALSTORAGE_PREFIX}`, false, parseBoolean);
export const toggleDevTools = createToggleBoolean($devTools);

export const $copyFrameworkAgnosticLinks = persistentAtom<boolean>(
    `${LOCALSTORAGE_PREFIX}:copyFrameworkAgnosticLinks`,
    false,
    parseBoolean
);
export const toggleCopyFrameworkAgnosticLinks = createToggleBoolean($copyFrameworkAgnosticLinks);

export const $fpsMonitor = persistentAtom<boolean>(`${LOCALSTORAGE_PREFIX}:fpsMonitor`, false, parseBoolean);
export const toggleFpsMonitor = createToggleBoolean($fpsMonitor);
