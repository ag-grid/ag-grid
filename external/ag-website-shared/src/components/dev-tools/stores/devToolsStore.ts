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

export const $exampleDevToolbar = persistentAtom<boolean>(
    `${LOCALSTORAGE_PREFIX}:exampleDevToolbar`,
    false,
    parseBoolean
);
export const toggleExampleDevToolbar = createToggleBoolean($exampleDevToolbar);

export const $openLinksInNewTab = persistentAtom<boolean>(
    `${LOCALSTORAGE_PREFIX}:openLinksInNewTab`,
    false,
    parseBoolean
);
export const toggleOpenLinksInNewTab = createToggleBoolean($openLinksInNewTab);
