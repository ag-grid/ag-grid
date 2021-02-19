import React from 'react';
import features from './features.json';
import groups from './feature-groups.json';
import images from 'images/features';
import styles from './FeatureOverview.module.scss';
import Code from './Code';

const featureMap = new Map();

features.forEach(feature => featureMap.set(feature.title, feature));

const toCamelCase = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

const FeatureOverview = () => (
    groups.map(group => (
        <div key={group.group} className={styles['feature-overview']}>
            <h3>{group.group}</h3>

            {group.items.map(item => {
                const feature = featureMap.get(item);

                if (!feature) return null;

                const imageSrc = images[toCamelCase(feature.title)];

                return (
                    <div className={styles['feature-overview__feature']} key={`${group.group}_${item}`}>
                        <h4 className={styles['feature-overview__feature_title']}>
                            <a href={feature.url}>{feature.title}</a>
                            {feature.enterprise && <enterprise-icon />}
                        </h4>
                        <div className={styles['feature-overview__feature_description']}>
                            <p dangerouslySetInnerHTML={{ __html: feature.description }} />
                            {feature.snippet && <Code code={feature.snippet} language='js' />}
                        </div>
                        <div className={styles['feature-overview__feature_image']}>
                            <a href={feature.url}>
                                {imageSrc && <img src={imageSrc} alt={feature.title} />}
                                See more
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    ))
);

export default FeatureOverview;
