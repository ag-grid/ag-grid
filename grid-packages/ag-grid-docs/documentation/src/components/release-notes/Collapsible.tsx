import React, { FunctionComponent, useState } from 'react';
import styles from './Collapsible.module.scss';

const TreeOpen = '/theme-icons/alpine/tree-open.svg';
const TreeClosed = '/theme-icons/alpine/tree-closed.svg';

interface Props {
    title: string;
}

const Collapsible: FunctionComponent<Props> = ({ title, children }) => {
    const [showNotes, setShowNotes] = useState(false);
    const image = showNotes ? TreeOpen : TreeClosed;

    const collapsibleHandler = () => {
        setShowNotes((prevShowNotes) => !prevShowNotes);
    };

    return (
        <div>
            <button className={styles.collapsible} onClick={collapsibleHandler}>
                {title}

                <img alt={'show/hide toggle'} src={image}></img>
            </button>
            {showNotes && children}
        </div>
    );
};
export default Collapsible;
