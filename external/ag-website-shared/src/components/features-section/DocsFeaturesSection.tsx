import type { Library } from '@ag-grid-types';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import type { FunctionComponent } from 'react';

import { Icon } from '../icon/Icon';
import data from './DocsFeaturesSection.json';
import styles from './features.module.scss';

interface Props {
    library: Library;
    type: 'community' | 'enterprise';
}

function Section({ index, feature }) {
    const framework = useFrameworkFromStore();
    const hasLink = !!feature.link;

    return hasLink ? (
        <a key={index} className={styles.card} href={urlWithPrefix({ framework, url: feature.link })}>
            <h4 className={styles.title}>
                {feature.title}

                <Icon name="chevronRight"></Icon>
            </h4>
            <p className={styles.description}>{feature.description}</p>
        </a>
    ) : (
        <span key={index} className={styles.card}>
            <h4 className={styles.title}>{feature.title}</h4>
            <p className={styles.description}>{feature.description}</p>
        </span>
    );
}

const FeaturesSection: FunctionComponent<Props> = ({ library, type }) => {
    const features = data[library][type];

    return (
        <div className={styles.container}>
            {features.map((feature, index) => (
                <Section key={index} index={index} feature={feature} />
            ))}
        </div>
    );
};

export default FeaturesSection;
