import type { Framework, InternalFramework } from '@ag-grid-types';
import { DEFAULT_INTERNAL_FRAMEWORK, INTERNAL_FRAMEWORKS } from '@constants';
import { persistentAtom, persistentMap } from '@nanostores/persistent';
import { getInternalFramework } from '@utils/framework';
import { atom } from 'nanostores';

export type FrameworkContext = {
    useTypescript: string;
};

export type InternalFrameworkState = 'init' | 'synced';

const LOCALSTORAGE_PREFIX = 'documentation';

export const $internalFramework = persistentAtom<InternalFramework>(
    `${LOCALSTORAGE_PREFIX}:internalFramework`,
    DEFAULT_INTERNAL_FRAMEWORK,
    { listen: false }
);
export const $frameworkContext = persistentMap<FrameworkContext>(`${LOCALSTORAGE_PREFIX}:context`, {
    useTypescript: 'true',
});
export const $internalFrameworkState = atom<InternalFrameworkState>('init');

/**
 * Set internal framework and update framework context
 */
export const setInternalFramework = (internalFramework: InternalFramework) => {
    // Update framework context
    if (internalFramework === 'vanilla') {
        $frameworkContext.setKey('useTypescript', 'false');
    } else if (internalFramework === 'typescript') {
        $frameworkContext.setKey('useTypescript', 'true');
    } else if (internalFramework === 'reactFunctional') {
        $frameworkContext.setKey('useTypescript', 'false');
    } else if (internalFramework === 'reactFunctionalTs') {
        $frameworkContext.setKey('useTypescript', 'true');
    }

    if (INTERNAL_FRAMEWORKS.includes(internalFramework)) {
        $internalFramework.set(internalFramework);
    } else {
        // eslint-disable-next-line no-console
        console.error('Unsupported internal framework', internalFramework);
        $internalFramework.set(DEFAULT_INTERNAL_FRAMEWORK);
    }
};

/**
 * Set internal framework state
 */
export const setInternalFrameworkState = (state: InternalFrameworkState) => {
    $internalFrameworkState.set(state);
};

/**
 * Get framework context key converting from localstorage string to
 * boolean value
 */
export const getFrameworkContextKeyBoolean = (key: keyof FrameworkContext): boolean => {
    const value = getFrameworkContextKey(key);

    return value === 'true';
};

/**
 * Get framework context key converting from localstorage string to
 * boolean value
 */
export const getFrameworkContextKey = (key: keyof FrameworkContext): string => {
    const context = $frameworkContext.get();

    return context[key];
};

/**
 * Update the internal framework based on the framework and current framework context
 */
export const updateInternalFrameworkBasedOnFramework = (framework: Framework) => {
    const internalFramework = getInternalFramework({
        framework,
        useTypescript: getFrameworkContextKeyBoolean('useTypescript'),
    });

    // NOTE: Set store directly instead of `setInternalFramework`, as
    // we don't want to update the framework context here since we are
    // using it to determine what to set to
    $internalFramework.set(internalFramework);
};
