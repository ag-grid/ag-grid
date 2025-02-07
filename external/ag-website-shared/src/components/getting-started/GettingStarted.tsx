import type { Library } from '@ag-grid-types';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import type { FunctionComponent } from 'react';

import { Icon } from '../icon/Icon';
import styles from './getting-started.module.scss';

interface Props {
    library: Library;
}

const GRID_FEATURES = [
    {
        icon: 'concepts',
        title: 'Key Features',
        description: 'Browse an overview of our commonly used features',
        link: './key-features/',
    },
    {
        icon: 'tutorials',
        title: 'Tutorials',
        description: 'Get started with our step-by-step tutorials',
        link: './deep-dive/',
    },
    {
        icon: 'communityEnterprise',
        title: 'Community vs. Enterprise',
        description: 'Understand the differences between each version',
        link: './community-vs-enterprise/',
    },
];

const CHARTS_FEATURES = [
    {
        icon: 'concepts',
        title: 'Key Features',
        description: 'Browse an overview of our commonly used features',
        link: './key-features/',
    },
    {
        icon: 'tutorials',
        title: 'Tutorials',
        description: 'Get started with our step-by-step tutorials',
        link: './create-a-basic-chart/',
    },
    {
        icon: 'communityEnterprise',
        title: 'Community vs. Enterprise',
        description: 'Understand the differences between each version',
        link: './community-vs-enterprise/',
    },
];

const GettingStarted: FunctionComponent<Props> = ({ library }) => {
    const framework = useFrameworkFromStore();

    const features = library === 'grid' ? GRID_FEATURES : CHARTS_FEATURES;

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
                        <div>
                            <Icon name="chevronRight" className={`${styles.icon} ${styles.arrowRight}`}></Icon>
                        </div>
                    </div>

                    <p className={styles.description}>{feature.description}</p>
                </a>
            ))}
        </div>
    );
};

export default GettingStarted;
