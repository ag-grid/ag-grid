import { Icon } from '@ag-website-shared/components/icon/Icon';
import classNames from 'classnames';
import { useState } from 'react';
import type { ReactNode } from 'react';

import styles from './ExpandingSection.module.scss';

interface Props {
    headerText: string;
    isOpen: boolean;
    children: ReactNode;
}

const ExpandingSection = ({ headerText, isOpen = false, children }: Props) => {
    const [sectionIsOpen, setSectionIsOpen] = useState(isOpen);

    const headerOnClick = () => {
        setSectionIsOpen(!sectionIsOpen);
    };

    return (
        <>
            <div className={classNames(styles.expandingSection, sectionIsOpen ? styles.open : styles.closed)}>
                <div className={classNames(styles.expandingSectionHeader, 'button-secondary')} onClick={headerOnClick}>
                    {headerText}
                    <Icon svgClasses={styles.expandingSectionChevron} name="chevronRight" />
                </div>

                <div className={styles.expandingSectionContent}>{children}</div>
            </div>
        </>
    );
};

export default ExpandingSection;
