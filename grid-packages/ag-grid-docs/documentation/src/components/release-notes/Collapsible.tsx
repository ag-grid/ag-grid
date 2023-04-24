import React, { FunctionComponent, useState } from 'react';
import CollapsibleChevron from '../../images/inline-svgs/collapsible-chevron.svg';
import styles from './Collapsible.module.scss';

interface Props {
    title: string;
}

const Collapsible: FunctionComponent<Props> = ({ title, children }) => {
    const [showNotes, setShowNotes] = useState(false);

    const collapsibleHandler = () => {
        setShowNotes((prevShowNotes) => !prevShowNotes);
    };

    return (
        <div className={showNotes && styles.isOpen}>
            <button className={styles.showHideButton} onClick={collapsibleHandler}>
                {title}

                <CollapsibleChevron />
            </button>

            {showNotes && <div className={styles.content}>{children}</div>}
        </div>
    );
};
export default Collapsible;
