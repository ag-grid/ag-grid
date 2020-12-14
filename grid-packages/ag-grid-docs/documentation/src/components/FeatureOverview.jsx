import React, { Fragment } from 'react';
import featurePlaceholderSVG from '../pages/grid-features/resources/feature-placeholder.svg';
import features from '../pages/grid-features/resources/features.json';
import groups from '../pages/grid-features/resources/feature-groups.json';
import styles from './FeatureOverview.module.scss';

const featureMap = new Map();

features.forEach(feature => {
    featureMap.set(feature.title, feature);
})

const FeatureOverview = () => (
    groups.map(group => (
        <div key={ group.group } className={styles['feature-overview']}>
            <h3>{ group.group }</h3>
            
            { group.items.map(item => {
                const feature = featureMap.get(item);
                if (!feature) return null;
                return (
                    <div className={ styles['feature-overview__feature'] } key={`${group.group}_${item}`}>
                        <h4 className={ styles['feature-overview__feature_title'] }>
                            <a href={ feature.url }>{ feature.title }</a>
                            { feature.enterprise && <enterprise-icon /> }
                        </h4>
                        <div className={ styles['feature-overview__feature_description'] }>
                            <p dangerouslySetInnerHTML={{ __html: feature.description }} />
                            { feature.snippet && <pre className="language-js">{ feature.snippet }</pre> }
                        </div>
                        <div className={ styles['feature-overview__feature_image'] }>
                            <a href={ feature.url }>
                                <img src={ featurePlaceholderSVG } data-src={ feature.src } alt={ feature.title } />
                                See more
                            </a>
                        </div>
                    </div>
                )
            })}
        </div>
    ))
)

export default FeatureOverview;