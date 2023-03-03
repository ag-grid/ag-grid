import classnames from 'classnames';
import React, { useState } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { Icon } from '../Icon';
import styles from './SearchBox.module.scss';

/**
 * The search box shown in the header at the top of the page.
 */
const SearchBox = ({ delay, refine, currentRefinement, className, onFocus, resultsOpen }) => {
    const [timerId, setTimerId] = useState();

    const onChangeDebounced = (event) => {
        const inputValue = event.target.value;

        clearTimeout(timerId);
        setTimerId(
            setTimeout(() => {
                refine(inputValue);
            }, delay)
        );
    };

    return (
        <form className={classnames(className, styles.searchBox)}>
            <input
                type="text"
                placeholder="Search documentation..."
                aria-label="Search"
                onChange={onChangeDebounced}
                onFocus={onFocus}
                className={resultsOpen ? styles.resultsOpen : ''}
            />

            <Icon name="search" />
        </form>
    );
};
export default connectSearchBox(SearchBox);
