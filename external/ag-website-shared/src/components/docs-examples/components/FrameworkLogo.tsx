import type { InternalFramework } from '@ag-grid-types';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import type { FunctionComponent } from 'react';

import styles from './FrameworkLogo.module.scss';

interface Props {
    internalFramework: InternalFramework;
}

const internalFrameworkConfig = {
    vanilla: {
        imageUrl: urlWithBaseUrl('images/fw-logos/javascript.svg'),
    },
    typescript: {
        text: 'TS',
    },
    reactFunctional: {
        imageUrl: urlWithBaseUrl('images/fw-logos/react.svg'),
    },
    reactFunctionalTs: {
        imageUrl: urlWithBaseUrl('images/fw-logos/react.svg'),
        imageSuffix: 'TS',
    },
    angular: {
        imageUrl: urlWithBaseUrl('images/fw-logos/angular.svg'),
    },
    vue3: {
        imageUrl: urlWithBaseUrl('images/fw-logos/vue.svg'),
    },
};

export const FrameworkLogo: FunctionComponent<Props> = ({ internalFramework }) => {
    const config = internalFrameworkConfig[internalFramework];
    let Logo = <>{internalFramework}</>;
    if (config.imageUrl) {
        Logo = (
            <span className={styles.image}>
                <img src={config.imageUrl} alt={internalFramework} width="20" height="20" />
                {config?.imageSuffix}
            </span>
        );
    } else if (config.text) {
        Logo = <>{config.text}</>;
    }

    return Logo;
};
