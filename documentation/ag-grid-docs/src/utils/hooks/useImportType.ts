import { IMPORT_TYPES } from '@constants';
import { useStore } from '@nanostores/react';
import { $frameworkContext, $internalFramework } from '@stores/frameworkStore';

export const useImportType = () => {
    const internalFramework = useStore($internalFramework);
    const frameworkStore = useStore($frameworkContext);

    if (!IMPORT_TYPES.includes(frameworkStore['importType'])) {
        $frameworkContext.setKey('importType', 'modules');
    }

    // Ignore importType for vanilla JS, as it only exists as packages.
    // Don't store it in `frameworkStore`, so that the user can keep their changes when changing to vanilla JS
    return internalFramework === 'vanilla' ? 'packages' : frameworkStore['importType'];
};
