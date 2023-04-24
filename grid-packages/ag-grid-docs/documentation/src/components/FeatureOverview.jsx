import React from 'react';
import images from 'images/features';
import Code from './Code';
import { convertUrl } from './documentation-helpers';
import features from './features.json';
import groups from './feature-groups.json';
import styles from './FeatureOverview.module.scss';

const featureMap = new Map();

features.forEach(feature => featureMap.set(feature.title, feature));

const toCamelCase = (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

/**
 * This shows an overview of the grid features.
 */
const FeatureOverview = ({ framework }) => (
    groups.map(group => (
        <div key={group.group} className={styles['feature-overview']}>
            <h3>{group.group}</h3>

            {group.items.map(item => {
                const feature = featureMap.get(item);

                if (!feature) return null;

                const imageSrc = images[toCamelCase(feature.title)];
                const url = convertUrl(feature.url, framework);

                return (
                    <div className={styles['feature-overview__feature']} key={`${group.group}_${item}`}>
                        <h4 className={styles['feature-overview__feature_title']}>
                            <a href={url}>{feature.title}</a>
                            {feature.enterprise && <enterprise-icon />}
                        </h4>
                        <div className={styles['feature-overview__feature_description']}>
                            <p dangerouslySetInnerHTML={{ __html: feature.description }} />
                            {feature.snippet && <Code code={feature.snippet} language='js' />}
                        </div>
                        <div className={styles['feature-overview__feature_image']}>
                            <a href={url}>
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
