import { useStore } from '@nanostores/react';
import { $frameworkContext, $internalFramework } from '@stores/frameworkStore';
import {USE_PACKAGES} from "@constants";
import {getIsDev} from "@utils/env";
import {setInternalFramework} from "@stores/frameworkStore";

export const useImportType = () => {
    const internalFramework = useStore($internalFramework);
    const frameworkStore = useStore($frameworkContext);

    if(getIsDev() && !USE_PACKAGES) {
        if(internalFramework === 'vanilla') {
            setInternalFramework('typescript');
        }

        return 'modules';
    }

    // Ignore importType for vanilla JS, as it only exists as packages.
    // Don't store it in `frameworkStore`, so that the user can keep their changes when changing to vanilla JS
    return internalFramework === 'vanilla' ? 'packages' : frameworkStore['importType'];
};
