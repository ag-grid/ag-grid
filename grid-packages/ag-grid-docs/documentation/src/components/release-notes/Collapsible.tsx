import classNames from 'classnames';
import React, { FunctionComponent, useState } from 'react';
import { Icon } from '../Icon';
import styles from './Collapsible.module.scss';

interface Props {
    title: string;
}

const extractNotesOpen = (location) =>
    location && location.search ? new URLSearchParams(location.search).get('showNotes') : false;

const Collapsible: FunctionComponent<Props> = ({ title, children }) => {
    const [showNotes, setShowNotes] = useState(extractNotesOpen(location));

    const collapsibleHandler = () => {
        setShowNotes((prevShowNotes) => !prevShowNotes);

        let url = new URL(window.location);

        if (!showNotes) {
            url.searchParams.set('showNotes', 'true');
        } else {
            url.searchParams.delete('showNotes');
        }

        window.history.pushState({}, '', url);
    };

    return (
        <div className={showNotes ? styles.isOpen : undefined}>
            <button className={styles.showHideButton} onClick={collapsibleHandler}>
                {title}

                <span className={classNames(styles.collapseIndicator, showNotes ? styles.isOpen : undefined)}>
                    <Icon name="chevronRight" />
                </span>
            </button>

            {showNotes && <div className={styles.content}>{children}</div>}
        </div>
    );
};
export default Collapsible;
