import { Icon } from '@ag-website-shared/components/icon/Icon';
import { FinanceExample } from '@components/demos/examples/finance/FinanceExample';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import React, { useRef, useState } from 'react';

import styles from './HeroSection.module.scss';

type Props = {
    versionsData: any[]; // Replace 'any[]' with the actual type of 'versionsData'
};

const MyComponent: React.FC<Props> = ({ versionsData }) => {
    const [isDarkMode] = useDarkmode();

    const handleClick = (path: string) => {
        window.open(path, '_blank');
    };

    const [isCopied, setIsCopied] = useState(false);
    const installTextRef = useRef<HTMLSpanElement>(null);
    const copyToClipboard = () => {
        const text = installTextRef?.current?.innerText.replace('$', '') ?? '';
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.headingContainer}>
                <div onClick={() => handleClick('/whats-new')} className={styles.versionTagContainer}>
                    <span className={styles.version}>AG Grid v{versionsData[0].version}</span>
                    <span className={styles.featureHighlight}>
                        {versionsData[0].landingPageHighlight}
                        <Icon svgClasses={styles.featureArrow} name="arrowRight" />
                    </span>
                </div>
                <h1 className={styles.heading}>Fast, Powerful and Flexible React Table</h1>
                <p className={styles.subHeading}>
                    Add <b>high-performance</b>, <b>feature rich</b>, and <b>fully customisable</b> React Data Tables to
                    your application in <b>minutes</b>, all for <b>free</b>.
                </p>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.cta1} onClick={() => handleClick('/react-data-grid/getting-started/')}>
                    Get Started
                </button>
                <div className={styles.cta2}>
                    <span ref={installTextRef} className={styles.installText}>
                        $ npm install ag-grid-react
                    </span>
                    <span className={styles.icon} onClick={copyToClipboard}>
                        <Icon svgClasses={styles.icon} name={isCopied ? 'tick' : 'copy'} />
                    </span>
                </div>
            </div>
            <div className={styles.demoContainer}>
                <FinanceExample isDarkMode={isDarkMode} gridHeight={600} />
                <button className={styles.buttonAsLink}>View All Demos</button>
            </div>
        </div>
    );
};

export default MyComponent;
