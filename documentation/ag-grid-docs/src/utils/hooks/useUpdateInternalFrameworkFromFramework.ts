import type { Framework } from '@ag-grid-types';
import { useStore } from '@nanostores/react';
import { $internalFramework, updateInternalFrameworkBasedOnFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect } from 'react';

/**
 * Update the internal framework store if it is different to the framework
 *
 * Use this on the page, to sync up the URL framework with the framework store in localstorage
 *
 * @param framework Framework
 */
export function useUpdateInternalFrameworkFromFramework(framework: Framework) {
    const internalFramework = useStore($internalFramework);

    useEffect(() => {
        const frameworkFromInternalFramework = getFrameworkFromInternalFramework(internalFramework);

        console.log({
            framework,
            internalFramework,
            frameworkFromInternalFramework,
        });
        if (frameworkFromInternalFramework !== framework) {
            updateInternalFrameworkBasedOnFramework(framework);
        }
    }, [internalFramework, framework]);
}
