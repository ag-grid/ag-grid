import { LinkIcon } from '@ag-website-shared/components/link-icon/LinkIcon';
import Slugger from 'github-slugger';
import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';

import styles from './Number.module.scss';

interface Props {
    children: ReactNode;
    number: string;
    title: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const NumberHeading: FunctionComponent<Props> = ({ level, title, number, children }) => {
    const Heading = level;
    const slugger = new Slugger();
    const headingId = slugger.slug(title);

    return (
        <div className={styles.numberHeading}>
            <div className={styles.numberContainer}>
                <div className={styles.number}>{number}</div> <div className={styles.verticalLine}></div>
            </div>
            <div className={styles.content}>
                <Heading id={headingId}>
                    {title} <LinkIcon href={`#${headingId}`} />
                </Heading>
                <div className={styles.sectionContent}>{children}</div>
            </div>
        </div>
    );
};
