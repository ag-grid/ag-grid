import { persistentAtom } from '@nanostores/persistent';

type BooleanString = 'true' | 'false';
const LOCALSTORAGE_PREFIX = 'devTools';

export const $devTools = persistentAtom<BooleanString | undefined>(`${LOCALSTORAGE_PREFIX}`);

export const toggleDevTools = () => {
    const currentValue = $devTools.get();
    const newValue = currentValue === 'true' ? 'false' : 'true';
    $devTools.set(newValue);
};

export const $exampleDevToolbar = persistentAtom<BooleanString | undefined>(`${LOCALSTORAGE_PREFIX}:exampleDevToolbar`);

export const toggleExampleDevToolbar = () => {
    const currentValue = $exampleDevToolbar.get();
    const newValue = currentValue === 'true' ? 'false' : 'true';
    $exampleDevToolbar.set(newValue);
};
