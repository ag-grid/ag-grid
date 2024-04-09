import { Icon } from '@ag-website-shared/components/icon/Icon';
import React, { useEffect, useRef } from 'react';
import { useHits, useSearchBox } from 'react-instantsearch';

import styles from './SearchBox.module.scss';

let timeout;

export default ({ selectedHit }) => {
    const { refine } = useSearchBox();
    const { hits } = useHits();
    const inputRef = useRef();

    // capture the click of anything above the separator and redirect to the input
    const onContainerClick = () => inputRef.current?.focus();
    // also capture focus to the input as soon as the modal opens
    useEffect(onContainerClick, []);

    // 300ms debounce before updating algolia, not sure if this should be higher
    const onInputChanged = (evt) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            refine(evt.target.value);
        }, 300);
    };

    return (
        <div role="presentation" className={styles.searchBox} onClick={onContainerClick}>
            <Icon name="search" svgClasses={styles.searchIcon} />

            <input
                ref={inputRef}
                type="search"
                placeholder="Search documentation..."
                className={styles.searchInput}
                onChange={onInputChanged}
                role="combobox"
                aria-activedescendant={`hit-${selectedHit}`}
                aria-controls="search-hits"
                aria-haspopup="search-hits"
                aria-expanded={hits.length > 0}
                aria-label="Press escape to close."
            />
        </div>
    );
};
