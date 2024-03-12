import type { Framework } from '@ag-grid-types';
import { DEFAULT_FRAMEWORK } from '@constants';
import { useStore } from '@nanostores/react';
import { $internalFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect, useState } from 'react';

/**
 * Get the framework from localstorage based on the internal framework
 *
 * On initial load, `DEFAULT_FRAMEWORK` is used and once client side code is run, the framework is retrieved
 * from localstorage
 */
export function useFrameworkFromStore() {
    const internalFramework = useStore($internalFramework);
    const [framework, setFramework] = useState<Framework>(DEFAULT_FRAMEWORK);

    useEffect(() => {
        const newFramework = getFrameworkFromInternalFramework(internalFramework);

        if (newFramework !== framework) {
            setFramework(newFramework);
        }
    }, [internalFramework]);

    return framework;
}
