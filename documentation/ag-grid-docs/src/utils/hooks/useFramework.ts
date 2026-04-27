import type { Framework, InternalFramework } from '@ag-grid-types';
import { DEFAULT_INTERNAL_FRAMEWORK } from '@constants';
import { $internalFramework, setInternalFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect, useState } from 'react';

import { useStoreSsr } from './useStoreSsr';

export const useFramework = () => {
    const internalFramework = useStoreSsr<InternalFramework>($internalFramework, DEFAULT_INTERNAL_FRAMEWORK);
    // Get framework using `useState` and update using
    // `useEffect` so that it works on Server Side Render
    // and on client side
    const [framework, setFramework] = useState<Framework>(
        getFrameworkFromInternalFramework(DEFAULT_INTERNAL_FRAMEWORK)
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing framework from store for SSR compatibility
        setFramework(getFrameworkFromInternalFramework(internalFramework));
    }, [internalFramework]);

    return {
        framework,
        internalFramework,
        setInternalFramework,
    };
};
