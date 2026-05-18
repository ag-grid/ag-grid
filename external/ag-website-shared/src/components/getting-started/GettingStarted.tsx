import type { Library } from '@ag-grid-types';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import type { FunctionComponent } from 'react';

import { Icon } from '../icon/Icon';
import styles from './getting-started.module.scss';

interface Props {
    library: Library;
}

type Feature = {
    icon: string;
    title: string;
    description: string;
    link: string;
};

const FEATURE_MAP: Record<Library, Feature[]> = {
    grid: [
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
    ],
    charts: [
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
    ],
    studio: [
        {
            icon: 'listBoxes',
            title: 'Overview',
            description: 'Learn about AG Studio and its key features.',
            link: './overview/',
        },
        {
            icon: 'code',
            title: 'Developers',
            description: 'Embed AG Studio into your application.',
            link: './quick-start/',
        },
        {
            icon: 'edit',
            title: 'Analysts',
            description: 'Learn how to build self-service reports.',
            link: './user-interface/',
        },
    ],
};

const GettingStarted: FunctionComponent<Props> = ({ library }) => {
    const framework = useFrameworkFromStore();

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
