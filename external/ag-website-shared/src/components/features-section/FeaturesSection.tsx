import type { FunctionComponent } from 'react';

import { Icon } from '../icon/Icon';
import styles from './features.module.scss';

const featuresSection: FunctionComponent = () => {
    const features = [
        {
            icon: 'concepts',
            title: 'Key Features',
            description: 'Browse our commonly used features',
            link: './key-features/',
        },
        {
            icon: 'tutorials',
            title: 'Tutorials',
            description: 'Features, themes and more',
            link: './deep-dive/',
        },
        {
            icon: 'communityEnterprise',
            title: 'Community & Enterprise',
            description: 'Compare the differences between versions',
            link: './community-vs-enterprise/',
        },
    ];

    return <div className={styles.container}>test</div>;
};

export default featuresSection;
