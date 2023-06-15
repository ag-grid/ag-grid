import classNames from 'classnames';
import React, { FunctionComponent, useState } from 'react';
import { Icon } from '../Icon';
import styles from './Collapsible.module.scss';

interface Props {
    title: string;
    versions: any[];
    fixVersion: string;
    onChange: (value: string) => any;
    children: any;
}

const Collapsible: FunctionComponent<Props> = ({ title, versions, fixVersion, onChange, children }) => {
    const [showNotes, setShowNotes] = useState(true);
    const [showMore, setShowMore] = useState(false);

    console.log(fixVersion, versions)

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
                <div>
                    {title}
                    <span className={classNames(styles.collapseIndicator, showNotes ? styles.isOpen : undefined)}>
                    <Icon name="chevronRight"/>
                </span>
                </div>

                <div className={styles.selectContainer}>
                    <label>
                        <select
                            value={fixVersion || versions[0]}
                            aria-label={'Select Release Version'}
                            onChange={(event) => onChange(event.target.value)}
                            onClick={(event) => event.stopPropagation()} // Prevent event propagation
                        >
                            {versions &&
                                versions.map((version) => (
                                    <option key={version} value={version}>
                                        {version}
                                    </option>
                                ))}
                        </select>
                    </label>
                </div>
            </button>
            {showNotes &&
                <div className={`${styles.content} ${showMore ? styles.contentExpanded : styles.contentCollapsed}`}>
                    <div>
                        {children}
                    </div>
                    <a
                        className={styles.showMoreLink}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowMore(!showMore);
                        }}
                    >
                    <span className={styles.showMoreContent}>
                        {showMore ? 'Show less' : 'Show more'}
                        <span>
                            <Icon name={showMore ? "chevronUp" : "chevronDown"}/>
                        </span>
                    </span>
                    </a>
                </div>
            }
        </div>
    );
};

export default Collapsible;
