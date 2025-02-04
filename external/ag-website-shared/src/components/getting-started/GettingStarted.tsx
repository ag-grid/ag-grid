import type { FunctionComponent } from 'react';

import { Icon } from '../icon/Icon';
import styles from './getting-started.module.scss';

const GettingStarted: FunctionComponent = () => {
    const features = [
        {
            icon: 'concepts',
            title: 'Key Concepts',
            description: 'Browse our commonly used features',
            link: '../quick-reference/',
        },
        {
            icon: 'tutorials',
            title: 'Tutorials',
            description: 'Features, themes and more',
            link: '../deep-dive/',
        },
        {
            icon: 'communityEnterprise',
            title: 'Community & Enterprise',
            description: 'Compare the differences between versions',
            link: '../community-vs-enterprise/',
        },
    ];

    return (
        <div className={styles.container}>
            {features.map((feature, index) => (
                <a href={feature.link}>
                    <div key={index} className={styles.card}>
                        <Icon name={feature.icon} className={styles.icon}>
                            {feature.icon}
                        </Icon>
                        <h3 className={styles.title}>{feature.title}</h3>
                        <p className={styles.description}>{feature.description}</p>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default GettingStarted;
