import type { Framework } from '@ag-grid-types';
import { USE_PACKAGES } from '@constants';
import { useStore } from '@nanostores/react';
import {
    $internalFramework,
    setInternalFramework,
    setInternalFrameworkState,
    updateInternalFrameworkBasedOnFramework,
} from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect } from 'react';

/**
 * Sync framework store with the state of the page
 */
export function useSyncFrameworkStoreState(framework: Framework) {
    const internalFramework = useStore($internalFramework);

    useEffect(() => {
        // Update the internal framework store if it is different to the framework to sync with localstorage
        const frameworkFromInternalFramework = getFrameworkFromInternalFramework(internalFramework);
        if (frameworkFromInternalFramework !== framework) {
            updateInternalFrameworkBasedOnFramework(framework);
        }

        // If using `modules` and set to vanilla, switch it to typescript so there aren't errors since vanilla doesn't have modules
        if (!USE_PACKAGES && internalFramework === 'vanilla') {
            setInternalFramework('typescript');
        }

        setInternalFrameworkState('synced');
    }, [internalFramework, framework]);
}
