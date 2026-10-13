import type { Framework, Library } from '@ag-grid-types';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import type { FunctionComponent } from 'react';

import { Icon } from '../icon/Icon';
import styles from './getting-started.module.scss';
import { FEATURE_MAP } from './gettingStartedData';

interface Props {
    library: Library;
    // Markdoc renders this at build time with no client hydration, so the page passes its framework; the
    // client-side search modal omits it and reads the selected framework from the store
    framework?: Framework;
}

const GettingStarted: FunctionComponent<Props> = ({ library, framework: pageFramework }) => {
    const storeFramework = useFrameworkFromStore();
    const framework = pageFramework ?? storeFramework;

    const features = FEATURE_MAP[library] || [];

    return (
        <div className={styles.container}>
            {features.map((feature, index) => (
                <a href={urlWithPrefix({ framework, url: feature.link })} key={index} className={styles.card}>
                    <div className={styles.iconGroup}>
                        <Icon name={feature.icon} className={styles.icon}>
                            {feature.icon}
                        </Icon>
                    </div>

                    <div className={styles.titleIcon}>
                        <h3 className={styles.title}>{feature.title}</h3>
                    </div>

                    <p className={styles.description}>{feature.description}</p>
                </a>
            ))}
        </div>
    );
};

export default GettingStarted;
