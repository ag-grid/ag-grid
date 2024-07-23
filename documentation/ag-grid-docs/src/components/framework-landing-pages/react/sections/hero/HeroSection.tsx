import { Icon } from '@ag-website-shared/components/icon/Icon';
import React from 'react';

import Example from '../../demos/kitchensink/KitchenSink';
import CustomerLogos from '../../utils/CustomerLogos';
import styles from './HeroSection.module.scss';

type Props = {
    // Define your component props here
};

const MyComponent: React.FC<Props> = () => {
    const handleClick = (path: string) => {
        window.open(path, '_blank');
    };

    return (
        <div className={styles.container}>
            <div className={styles.headingContainer}>
                <div onClick={() => handleClick('/whats-new')} className={styles.versionTagContainer}>
                    <span className={styles.version}>AG Grid v31.3.1</span>
                    <span className={styles.featureHighlight}>
                        New sticky group and grand total rows feature
                        <Icon svgClasses={styles.featureArrow} name="arrowRight" />
                    </span>
                </div>
                <h1 className={styles.heading}>Fast, Powerful and Flexible React Table</h1>
                <p className={styles.subHeading}>
                    Add <b>high-performance</b>, <b>feature rich</b>, and <b>fully customisable</b> data tables to your
                    React application in <b>minutes</b>, all for <b>free</b>.
                </p>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.cta1}>Get Started</button>
                <div className={styles.cta2}>
                    <span className={styles.installText}>$ npm install ag-grid-react</span>
                    <span className={styles.icon}>
                        <Icon name="copy" />
                    </span>
                </div>
            </div>
            <div className={styles.demoContainer}>
                <Example />
            </div>
        </div>
    );
};

export default MyComponent;
