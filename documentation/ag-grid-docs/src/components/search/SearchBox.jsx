import React, { useRef, useEffect } from 'react';
import styles from '@design-system/modules/SearchBox.module.scss';
import { useSearchBox } from 'react-instantsearch';
import { Icon } from '../icon/Icon';

let timeout;

export default () => {
    const {
        refine,
    } = useSearchBox();

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
        <div className={styles.searchBox} onClick={onContainerClick}>
            <Icon name="search" svgClasses={styles.searchIcon}/>
            
            <input ref={inputRef} type="search" placeholder='Search documentation...'  className={styles.searchInput} onChange={onInputChanged} /> 
        </div>
    );
}