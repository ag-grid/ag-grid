import type { Framework } from '@ag-grid-types';
import { useStore } from '@nanostores/react';
import { $internalFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect, useState } from 'react';

import { DocsNav } from './DocsNav';

export function DocsNavFromLocalStorage({ menuData, pageName }: { menuData: any; pageName: string }) {
    const internalFramework = useStore($internalFramework);
    const [framework, setFramework] = useState<Framework>();

    useEffect(() => {
        const newFramework = getFrameworkFromInternalFramework(internalFramework);

        if (newFramework !== framework) {
            setFramework(newFramework);
        }
    }, [internalFramework]);

    return framework && <DocsNav menuData={menuData} framework={framework} pageName={pageName} />;
}
