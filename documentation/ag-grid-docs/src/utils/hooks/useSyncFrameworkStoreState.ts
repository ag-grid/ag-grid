import type { Framework } from '@ag-grid-types';
import { USE_PACKAGES } from '@constants';
import { useStore } from '@nanostores/react';
import {
    $internalFramework,
    setInternalFramework,
    updateInternalFrameworkBasedOnFramework,
} from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect } from 'react';

/**
 * Sync framework store with the state of the page
 */
export function useSyncFrameworkStoreState(framework: Framework) {
    const internalFramework = useStore($internalFramework);

    // Update the internal framework store if it is different to the framework to sync with localstorage
    useEffect(() => {
        const frameworkFromInternalFramework = getFrameworkFromInternalFramework(internalFramework);
        if (frameworkFromInternalFramework !== framework) {
            updateInternalFrameworkBasedOnFramework(framework);
        }
    }, [internalFramework, framework]);

    // If using `modules` and set to vanilla, switch it to typescript so there aren't errors since vanilla doesn't have modules
    useEffect(() => {
        if (!USE_PACKAGES && internalFramework === 'vanilla') {
            setInternalFramework('typescript');
        }
    }, [internalFramework]);
}
