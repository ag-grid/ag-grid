import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Collapsible } from '@components/Collapsible';
import { useState } from 'react';

import DemosTabs from './DemosTabs';
import styles from './DemosTabs.module.scss';

const DemoTabsHeader = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleIsOpen = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    return (
        <div class={styles.tabsWrapper}>
            <Collapsible isOpen={isOpen}>
                <div class={styles.topHeader}>
                    <div>
                        <h1 class={styles.headerHeading}>Performance</h1>
                        <p class={styles.headerDescription}>
                            See the grid's performance by&nbsp;varying the number rows and&nbsp;columns.
                        </p>
                        <a
                            className={styles.videoTour}
                            href="https://youtu.be/bcMvTUVbMvI"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <button class="button-secondary">
                                <Icon alt={`Youtube logo`} name="youtube" svgClasses={styles.youtubeIcon} />
                                <span>Take the video tour</span>
                            </button>
                        </a>
                        <button class="button-secondary" onClick={toggleIsOpen} aria-expanded={isOpen}>
                            Collapse <Icon name="chevronUp" svgClasses={styles.chevronUp} />
                        </button>
                    </div>

                    <DemosTabs activeTab="complete" />
                </div>
            </Collapsible>
            <div className={`${styles.expandButton} ${isOpen ? styles.isExpanded : ''}`}>
                <button className="button-secondary" onClick={toggleIsOpen} aria-expanded={isOpen}>
                    Performance <Icon name="chevronUp" svgClasses={styles.chevronUp} />
                </button>
            </div>
        </div>
    );
};

export default DemoTabsHeader;
