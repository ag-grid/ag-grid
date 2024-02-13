import type { Framework, InternalFramework } from '@ag-grid-types';
import { persistentAtom, persistentMap } from '@nanostores/persistent';
import { getInternalFramework } from '@utils/framework';

export type FrameworkContext = {
    useTypescript: string;
    useVue3: string;
};

const LOCALSTORAGE_PREFIX = 'documentation';
const DEFAULT_INTERNAL_FRAMEWORK: InternalFramework = 'reactFunctional';

export const $internalFramework = persistentAtom<InternalFramework>(
    `${LOCALSTORAGE_PREFIX}:internalFramework`,
    DEFAULT_INTERNAL_FRAMEWORK,
    { listen: false }
);
export const $frameworkContext = persistentMap<FrameworkContext>(`${LOCALSTORAGE_PREFIX}:context`, {
    useTypescript: 'false',
    useVue3: 'false',
});

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
    } else if (internalFramework === 'vue') {
        $frameworkContext.setKey('useVue3', 'false');
    } else if (internalFramework === 'vue3') {
        $frameworkContext.setKey('useVue3', 'true');
    }

    $internalFramework.set(internalFramework);
};

/**
 * Get framework context key converting from localstorage string to
 * boolean value
 */
export const getFrameworkContextKey = (key: keyof FrameworkContext): boolean => {
    const context = $frameworkContext.get();

    return context[key] === 'true';
};

/**
 * Update the internal framework based on the framework and current framework context
 */
export const updateInternalFrameworkBasedOnFramework = (framework: Framework) => {
    const internalFramework = getInternalFramework({
        framework,
        useVue3: getFrameworkContextKey('useVue3'),
        useTypescript: getFrameworkContextKey('useTypescript'),
    });

    // NOTE: Set store directly instead of `setInternalFramework`, as
    // we don't want to update the framework context here since we are
    // using it to determine what to set to
    $internalFramework.set(internalFramework);
};
