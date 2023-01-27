import React, { useState } from 'react';
import Collapsible from '../grid/Collapsible';
import styles from './Changelog.module.scss';

const TreeOpen = '/theme-icons/alpine/tree-open.svg';
const TreeClosed = '/theme-icons/alpine/tree-closed.svg';

const ReleaseVersionNotes = (props) => {
    let [releaseNoteVisibility, setReleaseNoteVisibility] = useState('block');
    let [chevronState, setChevronState] = useState(TreeOpen);

    const collapsibleHandler = () => {
        if (releaseNoteVisibility === 'block') {
            setReleaseNoteVisibility('none');
            setChevronState(TreeClosed);
        } else {
            setReleaseNoteVisibility('block');
            setChevronState(TreeOpen);
        }
    };

    return props.releaseNotes ? (
        <div style={{ marginBottom: '2rem' }}>
            <Collapsible
                onClick={collapsibleHandler}
                chevronState={chevronState}
                message="Release Notes"
                class="release-notes-collapsible"
            />
            <div
                style={{ display: releaseNoteVisibility, marginTop: '1px' }}
                className={styles['note']}
                dangerouslySetInnerHTML={{ __html: props.releaseNotes }}
            ></div>
        </div>
    ) : null;
};

export default ReleaseVersionNotes;
